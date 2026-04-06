"use client";

import { useLayoutEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { sendOtpAction } from "@/lib/features/auth/actions/send-otp.action";
import { verifyOtpAction } from "@/lib/features/auth/actions/verify-otp.action";
import { toast } from "sonner";
import { authAction } from "@/lib/features/auth/actions/auth.action";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useLayoutEffect(() => {
    authAction(true)
      .then((res) => {
        if (res.isAuth) router.replace("/");
      })
      .finally(() => setIsAuthLoading(false));
  }, []);

  const handleSendOtp = async () => {
    const res = await sendOtpAction({ mobile: mobileNumber });
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    const res = await verifyOtpAction({ mobile: mobileNumber, otp });
    if (!res.success) {
      toast.error(res.error);
      return;
    }
  };

  if (isAuthLoading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="grow flex items-center justify-center p-4 bg-linear-to-br from-secondary/10 to-primary/10">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
            <CardDescription>
              {step === "mobile"
                ? "Enter your mobile number to receive verification code"
                : "Enter the verification code sent to your mobile"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "mobile" ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium px-3 py-2 border rounded-md bg-muted">
                      +98
                    </span>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="912 345 6789"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleSendOtp}
                  disabled={!mobileNumber || mobileNumber.length < 10}
                >
                  Send Verification Code
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Code sent to +98 {mobileNumber}</p>
                  <p className="mt-1">
                    {`Didn't receive code?`}{" "}
                    <button
                      className="text-primary hover:underline font-medium"
                      onClick={() => setStep("mobile")}
                    >
                      Resend
                    </button>
                  </p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 6}
                >
                  Verify Code
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col">
            <Separator className="my-4" />
            <p className="text-center text-sm text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
