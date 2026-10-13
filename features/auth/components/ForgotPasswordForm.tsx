import { Button } from "@/components/ui/button";

import { BackLink } from "@/components/BackLink";
import InputField from "@/components/InputField";
import { Field, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { forgotPasswordSchema } from "../schemas";
import { ForgotPasswordFormProps, ForgotPasswordFormType } from "../types";
import GoogleAuthButton from "./GoogleAuthButton";

export default function ForgotPasswordForm({
  fetchStatus,
  signIn,
  sendEmailCode,
  setIsCodeSent,
}: ForgotPasswordFormProps & { setIsCodeSent: (value: boolean) => void }) {
  const { handleSubmit, control } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormType) {
    const { error } = await signIn.create({
      identifier: data.email,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const isSent = await sendEmailCode();
    setIsCodeSent(isSent);
  }

  return (
    <form
      className="flex flex-col gap-6 w-full mt-14"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col gap-1 ">
          <BackLink href={"/sign-in"}>Back to login</BackLink>

          <h1 className="text-4xl font-bold"> Forgot your password?</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Don’t worry, happens to all of us. Enter your email below to recover
            your password
          </p>
        </div>

        <InputField
          name="email"
          control={control}
          label="Email Address"
          placeholder="john.doe@gmail.com"
          type="email"
        />

        <Field>
          <Button
            type="submit"
            className="h-12 text-md font-semibold"
            disabled={fetchStatus === "fetching"}
          >
            {fetchStatus === "fetching" ? (
              <p className="flex items-center gap-2">
                Submitting...
                <Loader2 className="size-4 animate-spin" />
              </p>
            ) : (
              "Submit"
            )}
          </Button>
        </Field>

        <FieldSeparator> Or login with</FieldSeparator>

        <Field>
          <GoogleAuthButton mode="signin" />
        </Field>
      </FieldGroup>
    </form>
  );
}
