import { Button, buttonVariants } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import InputField from "@/components/InputField";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { GoogleOneTap } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signInSchema } from "../schemas";
import { SignInFormType, UseSignInProps } from "../types";
import GoogleAuthButton from "./GoogleAuthButton";

export default function SignInForm({ signIn, fetchStatus }: UseSignInProps) {
  const { handleSubmit, control } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  async function onSubmit(data: SignInFormType) {
    await signIn.reset();

    const { error } = await signIn.password({
      emailAddress: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          // Handle session tasks
          if (session?.currentTask) {
            console.log(session?.currentTask);
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
    } else {
      console.error("Sign-in attempt not complete:", signIn);
      toast.error("An error occurred while signing in");
    }
  }

  return (
    <form
      className="flex flex-col gap-6 w-full mt-14"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col gap-1 ">
          <h1 className="text-4xl font-bold"> Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Login to access your Landora account
          </p>
        </div>
        <InputField
          label=" Email Address"
          control={control}
          name="email"
          placeholder="john.doe@gmail.com"
          type="email"
        />

        <InputField
          name="password"
          control={control}
          label="Password"
          placeholder="Password"
          type="password"
        />

        <div className="flex h-6 items-center justify-end">
          <Link
            href="/forgot-password"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-primary text-sm font-semibold",
            )}
          >
            Forgot Password?
          </Link>
        </div>

        <Field className=" gap-0">
          <div>{/*  */}</div>
          <Button type="submit" className="h-12 text-md font-semibold">
            {fetchStatus === "fetching" ? (
              <p className="flex items-center gap-2">
                Logging in...
                <Loader2 className="size-4 animate-spin" />
              </p>
            ) : (
              "Login"
            )}
          </Button>
        </Field>

        <FieldSeparator className="">Or login with</FieldSeparator>

        <Field>
          <GoogleAuthButton mode="signin" />
          <FieldDescription className="px-6 mt-1! text-md text-center">
            Don&apos;t have an account?{"  "}
            <Link href="/sign-up" className=" font-semibold">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
