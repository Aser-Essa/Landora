import { toast } from "sonner";
import VerifyForm from "./VerifyForm";
import { ForgotPasswordFormProps } from "../types";

export default function ForgotPasswordVerifyCodeForm({
  sendEmailCode,
  fetchStatus,
  signIn,
}: ForgotPasswordFormProps) {
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
    />
  );
}
