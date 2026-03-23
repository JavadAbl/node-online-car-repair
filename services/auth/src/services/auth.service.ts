import { randomInt } from "crypto";
import { cacheCheckConnection, cacheClient } from "../infrastructure/cache/cache-provider.js";
import { SendOtpDto } from "../schemas/auth/request/send-otp.schema.js";
import { BadRequestError, UnauthorizedError } from "../utils/app-error.js";
import { isEmptyObj, isMobileNumber } from "../utils/app.util.js";
import { VerifyOtpDto } from "../schemas/auth/request/verify-otp.schema.js";
import { userService } from "./user.service.js";
import { tokenService } from "./token.service.js";
import { AuthDto } from "../schemas/auth/reply/auth.schema.js";
import { PermissionRepository } from "../infrastructure/database/Repository/permission.repository.js";
import { PermissionsSyncEvent } from "../schemas/event-schemas/auth/permission-sync.schema.js";

export const authService = { sendOtp, verifyOtp, syncPermission };
const permissionRep = new PermissionRepository();

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

  const { accessToken, refreshToken } = tokenService.generateTokens({ userId: user.id });
  return { accessToken, refreshToken, user };
}

async function syncPermission(payload: PermissionsSyncEvent): Promise<void> {
  // Use a transaction to ensure data integrity
  await permissionRep.prisma.$transaction(async (tx) => {
    // 1. Extract the names of the incoming permissions
    const incomingNames = payload.map((p) => p.name);

    // 2. Delete permissions that are NOT in the incoming array
    // This handles the requirement: "if there is extra permission that doesnt exists in array should be removed"
    await tx.permission.deleteMany({ where: { name: { notIn: incomingNames } } });

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

function generateOtp() {
  //todo
  //Mock for client
  return "123456";
  return randomInt(100000, 999999).toString();
}
