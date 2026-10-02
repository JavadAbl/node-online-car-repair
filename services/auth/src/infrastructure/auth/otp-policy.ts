// otp-policy.ts
// Pure OTP throttling/lockout policy (no I/O) — enforced by auth.service
// through the Redis-backed otp-store. Kept pure so the whole decision
// matrix is testable without infrastructure.

export const OTP_POLICY = {
  /** How long a code stays valid (seconds). */
  OTP_TTL_SECONDS: 120,
  /** Minimum wait between two SendOtp calls for the same mobile (seconds). */
  RESEND_COOLDOWN_SECONDS: 60,
  /** Sliding window that caps how many codes may be sent (seconds). */
  SEND_WINDOW_SECONDS: 600,
  /** Max SendOtp calls per mobile per window. */
  MAX_SENDS_PER_WINDOW: 3,
  /** Max wrong VerifyOtp attempts per issued code (then the code is voided). */
  MAX_VERIFY_ATTEMPTS: 5,
  /** How long failed-attempt counts stick around after the code is gone (seconds). */
  ATTEMPTS_TTL_SECONDS: 300,
} as const;

export type SendDecision =
  | { allow: true }
  | { allow: false; status: 429; reason: "cooldown" | "window_exceeded"; retryAfterSeconds?: number };

/**
 * SendOtp gate, evaluated before a new code is generated.
 *  1. per-mobile resend cooldown (anti-harassment + SMS cost control)
 *  2. per-mobile volume cap over the sliding window (anti-abuse)
 */
export function evaluateSend(input: { cooldownActive: boolean; sendsInWindow: number }): SendDecision {
  if (input.cooldownActive) {
    return {
      allow: false,
      status: 429,
      reason: "cooldown",
      retryAfterSeconds: OTP_POLICY.RESEND_COOLDOWN_SECONDS,
    };
  }
  if (input.sendsInWindow >= OTP_POLICY.MAX_SENDS_PER_WINDOW) {
    return { allow: false, status: 429, reason: "window_exceeded" };
  }
  return { allow: true };
}

export type VerifyAttemptOutcome =
  | { kind: "no_code" } // expired/never issued/voided by lockout
  | { kind: "wrong"; attemptsLeft: number }
  | { kind: "wrong_final" } // this miss exhausted the attempts -> code must be voided
  | { kind: "match" };

/**
 * VerifyOtp decision for one submitted code. The caller applies the effects
 * (counter increments, voiding) via the store — this function only decides.
 */
export function evaluateVerify(input: { cachedOtp: string | null; submitted: string; failedAttempts: number }): VerifyAttemptOutcome {
  if (input.cachedOtp === null) return { kind: "no_code" };

  if (input.submitted !== input.cachedOtp) {
    const attemptsUsed = input.failedAttempts + 1;
    if (attemptsUsed >= OTP_POLICY.MAX_VERIFY_ATTEMPTS) return { kind: "wrong_final" };
    return { kind: "wrong", attemptsLeft: OTP_POLICY.MAX_VERIFY_ATTEMPTS - attemptsUsed };
  }

  return { kind: "match" };
}
