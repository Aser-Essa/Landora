"use client";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSignIn } from "@clerk/nextjs";
import { resetPasswordSchema } from "../schemas";
import { useRouter } from "next/navigation";
import { ResetPasswordFormType } from "../types";
import Link from "next/link";
import InputField from "@/components/InputField";
import { Field, FieldGroup } from "@/components/ui/field";
import { BackLink } from "@/components/BackLink";

export default function ResetPasswordForm() {
  const { signIn, fetchStatus } = useSignIn();

  const { handleSubmit, control } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const router = useRouter();

  async function onSubmit(data: ResetPasswordFormType) {
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password reset successfully");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/");
  }

  return (
    <form
      className="flex flex-col gap-6 w-full mt-14"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col gap-1 ">
          <BackLink href={"/sign-in"}>Back to login</BackLink>

          <h1 className="text-4xl font-bold"> Set a password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Your previous password has been reset. Please set a new password for
            your account.
          </p>
        </div>
        <InputField
          name="password"
          control={control}
          label="Password"
          placeholder="Password"
          type="password"
        />

        <InputField
          name="confirmPassword"
          control={control}
          label="Confirm Password"
          placeholder="Confirm Password"
          type="password"
        />

        <Field>
          <Button type="submit" className="h-12 text-md font-semibold">
            {fetchStatus === "fetching" ? (
              <p className="flex items-center gap-2">
                Setting new password...
                <Loader2 className="size-4 animate-spin" />
              </p>
            ) : (
              "Set Password"
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
