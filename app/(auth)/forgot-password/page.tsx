"use client";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import ForgotPasswordVerifyCodeForm from "@/features/auth/components/ForgotPasswordVerifyCodeForm";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import { useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";

export default function Page() {
  const { signIn, fetchStatus } = useSignIn();

  async function sendEmailCode() {
    const { error: sendCodeError } =
      await signIn.resetPasswordEmailCode.sendCode();

    if (sendCodeError) {
      toast.error(sendCodeError.message);
    }
  }

  if (signIn.status === "needs_first_factor") {
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
    />
  );
}
