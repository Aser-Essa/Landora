"use client";

import SignInForm from "@/features/auth/components/SignInForm";
import { useSignIn } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Page() {
  const { signIn, fetchStatus } = useSignIn();

  useEffect(() => {
    signIn.reset();
  }, []);

  return <SignInForm signIn={signIn} fetchStatus={fetchStatus} />;
}
