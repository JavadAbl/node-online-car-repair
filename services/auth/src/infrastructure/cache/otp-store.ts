// otp-store.ts
// Redis-backed storage for the OTP flow. All keys are namespaced per mobile:
//   otp:{mobile}      the active code (TTL = OTP_TTL_SECONDS)
//   otp:cd:{mobile}   resend cooldown marker (TTL = RESEND_COOLDOWN_SECONDS)
//   otp:send:{mobile} send counter over the sliding window (TTL = SEND_WINDOW_SECONDS)
//   otp:att:{mobile}  failed verify attempts (TTL = ATTEMPTS_TTL_SECONDS)
// The module is a plain object so tests can override individual methods.

import { cacheClient } from "./cache-provider.js";
import { OTP_POLICY } from "../auth/otp-policy.js";

export const otpStore = {
  /** Active code for the mobile, or null when expired/voided/never issued. */
  async getCode(mobile: string): Promise<string | null> {
    const value = await cacheClient.get(`otp:${mobile}`);
    return value ?? null;
  },

  async setCode(mobile: string, code: string): Promise<void> {
    await cacheClient.setEx(`otp:${mobile}`, OTP_POLICY.OTP_TTL_SECONDS, code);
  },

  async deleteCode(mobile: string): Promise<void> {
    await cacheClient.del(`otp:${mobile}`);
  },

  /** True while the resend cooldown for this mobile is active. */
  async hasCooldown(mobile: string): Promise<boolean> {
    return (await cacheClient.exists(`otp:cd:${mobile}`)) === 1;
  },

  /** Starts the resend cooldown (no-op if one is already running). */
  async startCooldown(mobile: string): Promise<void> {
    // SET key value NX EX seconds — only sets when no cooldown is active.
    await cacheClient.sendCommand([
      "SET",
      `otp:cd:${mobile}`,
      "1",
      "NX",
      "EX",
      String(OTP_POLICY.RESEND_COOLDOWN_SECONDS),
    ]);
  },

  /** Send counter over the sliding window (0 when none recorded). */
  async getSendCount(mobile: string): Promise<number> {
    const value = await cacheClient.get(`otp:send:${mobile}`);
    return value ? Number(value) : 0;
  },

  /**
   * Increments the send counter; arms the window TTL on the first hit.
   * Returns the counter value AFTER the increment.
   */
  async incrSendCount(mobile: string): Promise<number> {
    const key = `otp:send:${mobile}`;
    const count = await cacheClient.incr(key);
    if (count === 1) {
      // EXPIRE NX: keep an existing TTL if a previous race already armed one.
      await cacheClient.expire(key, OTP_POLICY.SEND_WINDOW_SECONDS, "NX");
    }
    return count;
  },

  /** Failed verify attempts recorded for the mobile (0 when none). */
  async getFailedAttempts(mobile: string): Promise<number> {
    const value = await cacheClient.get(`otp:att:${mobile}`);
    return value ? Number(value) : 0;
  },

  /** Records one more failed attempt. Returns the updated count. */
  async incrFailedAttempts(mobile: string): Promise<number> {
    const key = `otp:att:${mobile}`;
    const count = await cacheClient.incr(key);
    if (count === 1) {
      await cacheClient.expire(key, OTP_POLICY.ATTEMPTS_TTL_SECONDS, "NX");
    }
    return count;
  },

  /** Clears attempt history (after a successful verify or when issuing a new code). */
  async resetFailedAttempts(mobile: string): Promise<void> {
    await cacheClient.del(`otp:att:${mobile}`);
  },
};
