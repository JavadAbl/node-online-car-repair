import { randomInt } from "crypto";
import { cacheCheckConnection, cacheClient } from "../infrastructure/cache/cache-provider.js";
import { SendOtpDto } from "../schemas/auth/request/send-otp.schema.js";
import { BadRequestError, UnauthorizedError } from "../utils/app-error.js";
import { isEmptyObj, isMobileNumber } from "../utils/app.util.js";
import { VerifyOtpDto } from "../schemas/auth/request/verify-otp.schema.js";
import { userService } from "./user.service.js";
import { tokenService } from "./token.service.js";
import { AuthDto } from "../schemas/auth/reply/auth.schema.js";
import { PermissionsSyncEvent } from "../schemas/event-schemas/auth/permission-sync.schema.js";
import { CreateRolePermission } from "../schemas/auth/request/create-role-permission.schema.js";
import { rolePermissionRepository } from "../infrastructure/database/Repository/role-permission.repository.js";
import { permissionRepository } from "../infrastructure/database/Repository/permission.repository.js";
import { rmqPublisher } from "../infrastructure/rabbitmq/rmq.provider.js";
import {
  RMQ_P_RK_ROLE_PERMISSION_CREATE,
  RMQ_P_RK_ROLE_PERMISSION_DELETE,
} from "../infrastructure/rabbitmq/config/rmq-config.js";
import { GetManyQuery } from "../schemas/common/get-many-request.schema.js";
import { buildFindManyArgs } from "../utils/prisma.util.js";
import { RolePermissionDto } from "../schemas/auth/reply/role-permission.schema.js";
import { RefreshDto } from "../schemas/auth/request/refresh.schema.js";

const OTP_EXPIRE = 120; // 120 Second expiry

async function sendOtp(payload: SendOtpDto) {
  const { mobile } = payload;
  if (!isMobileNumber(mobile)) throw new BadRequestError("Invalid mobile");

  const otp = generateOtp();

  await cacheCheckConnection();
  await cacheClient.setEx(`otp:${mobile}`, OTP_EXPIRE, otp);

  //todo
  //Mock send sms
}

async function verifyOtp(payload: VerifyOtpDto): Promise<AuthDto> {
  const { mobile, otp } = payload;
  if (!isMobileNumber(mobile)) throw new BadRequestError("Invalid mobile");

  const cachedOtp = await cacheClient.get(`otp:${mobile}`);
  if (isEmptyObj(cachedOtp)) throw new BadRequestError("Otp code was expired");

  if (otp !== cachedOtp) throw new UnauthorizedError("Wrong otp code");

  const user = await userService.getOrCreateUserForLogin(mobile);

  const { accessToken, refreshToken } = tokenService.generateTokens({ userId: user.id, role: user.role });
  return { accessToken, refreshToken };
}

async function refresh(payload: RefreshDto): Promise<AuthDto> {
  const { refreshToken } = payload;

  const refreshPayload = tokenService.verifyRefreshToken(refreshToken);
  const { accessToken, refreshToken: newRefreshToken } = tokenService.generateTokens({
    userId: refreshPayload.userId,
    role: refreshPayload.role,
  });

  return { accessToken, refreshToken: newRefreshToken };
}

async function syncPermission(payload: PermissionsSyncEvent): Promise<void> {
  // Use a transaction to ensure data integrity
  await permissionRepository.prisma.$transaction(async (tx) => {
    // 1. Extract the names of the incoming permissions
    let serviceName;
    const incomingNames = payload.map((p) => {
      if (p.type === "Service") serviceName = p.name;
      return p.name;
    });

    // 2. Delete permissions that are NOT in the incoming array
    // This handles the requirement: "if there is extra permission that doesnt exists in array should be removed"
    await tx.permission.deleteMany({ where: { name: { notIn: incomingNames, contains: serviceName } } });

    // 3. Upsert (Update or Insert) the incoming permissions
    // This handles the requirement: "new permissions should be inserted"
    // It also handles cases where the permission exists but the 'Type' might have changed.
    for (const permission of payload) {
      await tx.permission.upsert({
        where: { name: permission.name },
        update: { type: permission.type }, // Update type if it changed
        create: { name: permission.name, type: permission.type },
      });
    }
  });
}

function getRolePermissions(query: GetManyQuery<"RolePermission">): Promise<RolePermissionDto[]> {
  const criteria = buildFindManyArgs<"RolePermission">(query);
  return rolePermissionRepository.findMany(criteria);
}

async function createRolePermission(payload: CreateRolePermission): Promise<void> {
  const { permissionName, role } = payload;
  await rolePermissionRepository.checkDuplicateBy(
    { where: { permissionName, role } },
    "permissionName",
    permissionName,
  );

  await permissionRepository.findAndCheckExistsBy(
    { where: { name: permissionName } },
    "name",
    permissionName,
  );
  const createdRolePermission = await rolePermissionRepository.create({ data: { permissionName, role } });
  await rmqPublisher.publish(RMQ_P_RK_ROLE_PERMISSION_CREATE, createdRolePermission);
}

async function deleteRolePermission(id: number): Promise<void> {
  await rolePermissionRepository.findAndCheckExistsBy({ where: { id } }, "id", id);
  await rolePermissionRepository.remove({ where: { id } });
  await rmqPublisher.publish(RMQ_P_RK_ROLE_PERMISSION_DELETE, { id });
}

function generateOtp() {
  //todo
  //Mock for client
  return "123456";
  return randomInt(100000, 999999).toString();
}

export const authService = {
  sendOtp,
  verifyOtp,
  syncPermission,
  createRolePermission,
  deleteRolePermission,
  getRolePermissions,
  refresh,
};
