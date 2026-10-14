import { toast } from "sonner";
import VerifyForm from "./VerifyForm";
import { ForgotPasswordFormProps } from "../types";
import { useRouter } from "next/navigation";

export default function ForgotPasswordVerifyCodeForm({
  sendEmailCode,
  fetchStatus,
  signIn,
}: ForgotPasswordFormProps) {
  const router = useRouter();

  async function handleVerify(data: { code: string }) {
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({
      code: data.code,
    });

    if (error) {
      toast.error(error.message);
    }
  }

  return (
    <VerifyForm
      handleVerify={handleVerify}
      sendEmailCode={sendEmailCode}
      fetchStatus={fetchStatus}
      onBack={() => {
        signIn.reset();
        router.refresh();
      }}
    />
  );
}
