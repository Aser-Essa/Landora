"use client";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import ForgotPasswordVerifyCodeForm from "@/features/auth/components/ForgotPasswordVerifyCodeForm";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { signIn, fetchStatus } = useSignIn();

  const [isCodeSent, setIsCodeSent] = useState(false);

  async function sendEmailCode() {
    const { error: sendCodeError } =
      await signIn.resetPasswordEmailCode.sendCode();

    if (sendCodeError) {
      toast.error(sendCodeError.message);
      return false;
    }

    toast.success("Verification code sent to your email");
    return true;
  }

  if (signIn.status === "needs_first_factor" && isCodeSent) {
    return (
      <ForgotPasswordVerifyCodeForm
        sendEmailCode={sendEmailCode}
        fetchStatus={fetchStatus}
        signIn={signIn}
      />
    );
  }

  if (signIn.status === "needs_new_password") {
    return <ResetPasswordForm />;
  }

  return (
    <ForgotPasswordForm
      fetchStatus={fetchStatus}
      signIn={signIn}
      sendEmailCode={sendEmailCode}
      setIsCodeSent={setIsCodeSent}
    />
  );
}
