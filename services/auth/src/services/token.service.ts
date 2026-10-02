import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { randomUUID } from "crypto";
import { config } from "../infrastructure/config.js";
import { UnauthorizedError } from "../utils/app-error.js";

export const tokenService = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
};

const JWT_ACCESS_SECRET = config.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = config.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";
/** Refresh-token lifetime in ms — mirrored into the RefreshToken DB rows. */
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface TokenPayload {
  userId: number;
  role?: string;
  /**
   * Granted permission names (role grants + user grants), top-level only.
   * The hierarchy is implicit: a service/controller grant covers all its children,
   * so children are never enumerated (keeps the token small).
   */
  permissions?: string[];
}

export interface DecodedToken extends TokenPayload, JwtPayload {
  iat: number;
  exp: number;
  /** Present on refresh tokens only (rotation/revocation key). */
  jti?: string;
  /** Token type guard: "access" | "refresh". */
  typ?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface GenerateOptions {
  /**
   * Pre-generated jti for the refresh token. The auth service creates the
   * RefreshToken DB row FIRST (fail-closed) and then asks for the JWT that
   * embeds this same jti. When omitted a fresh uuid is generated.
   */
  refreshJti?: string;
}

/**
 * Generates both Access and Refresh tokens.
 */
function generateTokens(payload: TokenPayload, opts: GenerateOptions = {}): TokenResponse {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload, opts.refreshJti);

  return { accessToken, refreshToken };
}

/**
 * Generates a short-lived Access Token
 */
function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: "your-app-name", // Optional: identifies the issuer
    audience: "your-app-users", // Optional: identifies the audience
  };

  return jwt.sign({ ...payload, typ: "access" }, JWT_ACCESS_SECRET, options);
}

/**
 * Generates a long-lived Refresh Token.
 * Carries a unique `jti` (rotation/revocation key, persisted server-side)
 * and `typ: "refresh"` so the two token kinds can never be confused.
 */
function generateRefreshToken(payload: TokenPayload, jti: string = randomUUID()): string {
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRES_IN };

  return jwt.sign({ ...payload, jti, typ: "refresh" }, JWT_REFRESH_SECRET, options);
}

/**
 * Verifies an Access Token
 * Returns the decoded payload if valid, or throws an error if invalid/expired
 */
function verifyAccessToken(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as DecodedToken;
    if (decoded.typ && decoded.typ !== "access") throw new Error("wrong type");
    return decoded;
  } catch {
    throw new UnauthorizedError("Invalid or Expired Access Token");
  }
}

/**
 * Verifies a Refresh Token and enforces the refresh-token shape:
 * signed with the refresh secret AND carrying a usable `jti`.
 * Tokens without `jti` are pre-rotation legacy tokens and are rejected
 * (their holders must log in again once).
 */
function verifyRefreshToken(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as DecodedToken;
    if (decoded.typ !== "refresh") throw new Error("wrong type");
    if (typeof decoded.jti !== "string" || decoded.jti.length === 0) throw new Error("legacy token");
    return decoded;
  } catch {
    throw new UnauthorizedError("Invalid or Expired Refresh Token");
  }
}
