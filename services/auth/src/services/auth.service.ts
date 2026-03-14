import { randomInt } from "crypto";
import { cacheCheckConnection, cacheClient } from "../infrastructure/cache/cache-provider.js";
import { SendOtpDto } from "../schemas/auth/request/send-otp.schema.js";
import { BadRequestError, UnauthorizedError } from "../utils/app-error.js";
import { isEmptyObj, isMobileNumber } from "../utils/app.util.js";
import { VerifyOtpDto } from "../schemas/auth/request/verify-otp.schema.js";
import { userService } from "./user.service.js";
import { tokenService } from "./token.service.js";
import { AuthDto } from "../schemas/auth/reply/auth.schema.js";
import { CreatePermissionDto } from "../schemas/auth/request/create-permission.schema.js";
import { PermissionRepository } from "../infrastructure/database/Repository/permission.repository.js";

export const authService = { sendOtp, verifyOtp, createPermission, deletePermission };
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

  return { otp };
}

async function verifyOtp(payload: VerifyOtpDto): Promise<AuthDto> {
  const { mobile, otp } = payload;
  if (!isMobileNumber(mobile)) throw new BadRequestError("Invalid mobile");

  const cachedOtp = await cacheClient.get(`otp:${mobile}`);
  if (isEmptyObj(cachedOtp)) throw new BadRequestError("Otp code was expired");

  if (otp !== cachedOtp) throw new UnauthorizedError("Wrong otp code");

  const user = await userService.getUserForLogin(mobile);

  const { accessToken, refreshToken } = tokenService.generateTokens({ userId: user.id });
  return { accessToken, refreshToken, user };
}

async function createPermission(payload: CreatePermissionDto): Promise<void> {
  const { name } = payload;
  const lowerName = name.toLocaleLowerCase();
  await permissionRep.checkDuplicateBy({ where: { name: lowerName } }, "name", name);
  await permissionRep.create({ data: { name: lowerName } });
}

async function deletePermission(id: number): Promise<void> {
  await permissionRep.findAndCheckExistsBy({ where: { id } }, "id", id);
  await permissionRep.remove({ where: { id } });
}

function generateOtp() {
  //todo
  //Mock for client
  return "123456";
  return randomInt(100000, 999999).toString();
}
