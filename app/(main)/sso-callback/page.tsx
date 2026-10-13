"use client";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Page() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const hasRun = useRef(false);

  useEffect(() => {
    async function handleCallback() {
      if (hasRun.current) return;
      hasRun.current = true;
      if (
        signUp.status === "missing_requirements" &&
        signUp.verifications.externalAccount.status === "transferable"
      ) {
        await signIn.create({ transfer: true });
      }

      await clerk.handleRedirectCallback({
        signInUrl: "/sign-in",
        signUpUrl: "/sign-up",
        signInFallbackRedirectUrl: "/",
        signUpFallbackRedirectUrl: "/",
      });
    }

    handleCallback().catch(console.error);
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 font-sans text-foreground">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[38%] size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/6 blur-[100px]"
      />

      {/* Brand */}
      <div className="absolute left-8 top-8 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-lg font-black">L</span>
        </div>

        <span className="text-base font-semibold tracking-tight">landora</span>
      </div>

      {/* Verification content */}
      <section
        aria-live="polite"
        aria-busy="true"
        className="relative flex w-full max-w-sm flex-col items-center text-center"
      >
        {/* Icon */}
        <div className="relative mb-8 flex size-19 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.07]">
          <div className="absolute inset-0 animate-pulse rounded-2xl bg-primary/4" />

          <ShieldCheck
            aria-hidden="true"
            className="relative size-8 text-primary"
            strokeWidth={1.6}
          />

          <span className="absolute -right-1 -top-1 size-3 rounded-full border-[3px] border-background bg-primary" />
        </div>

        {/* Text */}
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Account security
        </p>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
          Verifying your account
        </h1>

        <p className="mt-3 max-w-72.5 text-sm leading-6 text-muted-foreground">
          Hang tight. We&apos;re confirming your identity to keep your account
          secure.
        </p>

        {/* Loading indicator */}
        <div
          className="mt-9 h-1 w-full max-w-55 overflow-hidden rounded-full bg-muted"
          role="presentation"
        >
          <div className="h-full w-2/5 animate-[verification_1.6s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          This usually takes just a moment
        </p>
      </section>

      {/* Footer */}
      <p className="absolute bottom-7 px-6 text-center text-xs text-muted-foreground/60">
        Secure authentication · Powered by Landora
      </p>
    </main>
  );
}
