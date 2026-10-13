"use client";

import { SignUpForm } from "@/features/auth/components/SignUpForm";
import SignUpVerifyForm from "@/features/auth/components/SignUpVerifyForm";
import { useSignUp } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Page() {
  const { signUp, fetchStatus } = useSignUp();

  useEffect(() => {
    signUp.reset();
  }, []);

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return <SignUpVerifyForm signUp={signUp} fetchStatus={fetchStatus} />;
  }

  return <SignUpForm signUp={signUp} fetchStatus={fetchStatus} />;
}
