import { z } from "zod";

export const VerifyOtpSchema = z.object({
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[0-9+\-\s()]{10,}$/, "Invalid mobile number format"),

  otp: z.string().nonempty({ error: "Otp number is required" }),
});

export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;
