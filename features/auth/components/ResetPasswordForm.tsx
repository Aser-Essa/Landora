"use client";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { BackLink } from "@/components/BackLink";
import InputField from "@/components/InputField";
import { Field, FieldGroup } from "@/components/ui/field";
import { useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPasswordSchema } from "../schemas";
import { ResetPasswordFormType } from "../types";

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

    if (signIn.status === "complete") {
      const { error } = await signIn.finalize({
        navigate: async ({ session, decorateUrl }) => {
          // Handle session tasks
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }

          // If no session tasks, navigate the signed-in user to the home page
          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
      toast.error("Something went wrong, please try again");
    }
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
