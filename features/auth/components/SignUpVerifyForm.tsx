"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import VerifyForm from "./VerifyForm";
import type { UseSignUpProps } from "../types";

export default function SignUpVerifyForm({
  signUp,
  fetchStatus,
}: UseSignUpProps) {
  const router = useRouter();

  const handleVerify = async ({ code }: { code: string }) => {
    const { error } = await signUp.verifications.verifyEmailCode({
      code,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session.currentTask) {
            toast.error("Sign up attempt not complete");
            return;
          }

          const url = decorateUrl("/");

          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });

      toast.success("You have successfully signed up");
    } else {
      toast.error("Sign up attempt not complete");
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  return (
    <VerifyForm
      handleVerify={handleVerify}
      sendEmailCode={signUp.verifications.sendEmailCode}
      fetchStatus={fetchStatus}
    />
  );
}
