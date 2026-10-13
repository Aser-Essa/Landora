import type z from "zod";
import type {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifySchema,
} from "../schemas";
import { useSignIn, useSignUp } from "@clerk/nextjs";

export type SignupFormType = z.infer<typeof signUpSchema>;

export type SignInFormType = z.infer<typeof signInSchema>;

export type VerifyFormValues = z.infer<typeof verifySchema>;

export type ForgotPasswordFormType = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordFormType = z.infer<typeof resetPasswordSchema>;

export interface UseSignUpProps {
  signUp: ReturnType<typeof useSignUp>["signUp"];
  fetchStatus: "idle" | "fetching";
}

export interface UseSignInProps {
  signIn: ReturnType<typeof useSignIn>["signIn"];
  fetchStatus: "idle" | "fetching";
}

export interface ForgotPasswordFormProps {
  fetchStatus: "idle" | "fetching";
  signIn: ReturnType<typeof useSignIn>["signIn"];
  sendEmailCode: () => Promise<boolean>;
}
