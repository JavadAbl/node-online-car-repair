// otp-mock.ts
// Dev-only mock OTP (no SMS provider yet). When OTP_FIXED_CODE is set and
// NODE_ENV=development, sendOtp stores that fixed code instead of a random
// one — the code still flows through the REAL pipeline (Redis TTL, resend
// cooldown, volume cap, attempt limits), so dev keeps exercising the
// production behavior; only the generated value is predictable.
//
// Production safety: the fixed code is HARD-IGNORED unless NODE_ENV is
// "development". Even if a copy-pasted .env.docker carries OTP_FIXED_CODE
// into a prod deployment (compose prod.yaml forces NODE_ENV=production),
// logins will use real random codes and a loud error is logged at boot.

import { config, isDev } from "../config.js";

const raw = (config.OTP_FIXED_CODE || "").trim();

/** True when the mock is active (dev + non-empty value). */
export const MOCK_OTP_ENABLED = raw.length > 0 && isDev;

/** The fixed code sendOtp must store, or null when disabled. */
export const MOCK_OTP_CODE: string | null = MOCK_OTP_ENABLED ? raw : null;

// Boot-time diagnostics (evaluated once at module load).
if (raw.length > 0 && !isDev) {
  console.error(
    "[otp] OTP_FIXED_CODE is set but NODE_ENV is not \"development\" — " +
      "the fixed code is IGNORED and real random codes will be issued. " +
      "Remove OTP_FIXED_CODE from this environment.",
  );
} else if (MOCK_OTP_ENABLED && !/^\d{6}$/.test(raw)) {
  // Not fatal — whatever is set must simply be typed verbatim at verify —
  // but the login UI expects a 6-digit code, so warn about typos early.
  console.warn(
    `[otp] OTP_FIXED_CODE="${raw}" is not a 6-digit code; the login UI may reject it. ` +
      "Recommended value: 123456",
  );
}
