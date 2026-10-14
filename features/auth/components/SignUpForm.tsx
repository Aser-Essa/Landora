"use client";
import { cn } from "cn";

import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { GoogleOneTap } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signUpSchema } from "../schemas";
import { SignupFormType, UseSignUpProps } from "../types";
import GoogleAuthButton from "./GoogleAuthButton";

export function SignUpForm({ signUp }: UseSignUpProps) {
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignupFormType) {
    await signUp.reset();
    const { error } = await signUp.password({
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      toast.error(sendError.message);
    }
  }
  return (
    <form
      className={cn("flex flex-col gap-6 w-full mt-14")}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <div className="flex flex-col gap-1 ">
          <h1 className="text-4xl font-bold">Create your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Fill in the form below to create your account
          </p>
        </div>
        <div className=" flex items-start justify-between gap-3">
          <InputField
            control={control}
            name="firstName"
            label="First Name"
            placeholder="John"
          />

          <InputField
            control={control}
            name="lastName"
            label="Last Name"
            placeholder="Doe"
          />
        </div>

        <InputField
          control={control}
          name="email"
          label="Email"
          placeholder="m@example.com"
        />
        <InputField
          control={control}
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
          description="Must be at least 8 characters long."
        />
        <InputField
          control={control}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm Password"
          type="password"
        />

        <Field className=" gap-0">
          <Button type="submit" className={"h-12 text-md font-semibold"}>
            Create Account
          </Button>
        </Field>

        <FieldSeparator className="">Or continue with</FieldSeparator>

        <Field>
          <GoogleAuthButton mode="signup" />

          <FieldDescription className="px-6 mt-1! text-md text-center">
            Already have an account?{"  "}
            <Link href="/sign-in" className=" font-semibold">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
