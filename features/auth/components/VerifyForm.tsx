"use client";

import { BackLink } from "@/components/BackLink";
import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { verifySchema } from "../schemas";
import { VerifyFormValues } from "../types";
import { usePathname } from "next/navigation";

type Props = {
  handleVerify: (data: VerifyFormValues) => Promise<void>;
  sendEmailCode: () => void;
  fetchStatus: "idle" | "fetching";
};

export default function VerifyForm({
  handleVerify,
  sendEmailCode,
  fetchStatus,
}: Props) {
  const { handleSubmit, control } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const pathname = usePathname();

  return (
    <div>
      <div className="mb-8 space-y-4">
        {pathname === "/sign-up" ? (
          <BackLink href={"/sign-up"}>Back to signup</BackLink>
        ) : (
          <BackLink href={"/sign-in"}>Back to login</BackLink>
        )}

        <h3 className="font-trade-gothic text-[32px] leading-none font-bold">
          Verify code
        </h3>

        <p className="text-sm text-muted-foreground">
          An authentication code has been sent to your email.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleVerify)}>
        <InputField
          control={control}
          name="code"
          label="Code"
          placeholder="Enter verification code"
        />

        <div className="mt-4 flex items-center gap-1 text-center text-sm">
          <p className="font-medium">Didn’t receive a code?</p>

          <button
            type="button"
            onClick={sendEmailCode}
            className="text-primary font-semibold hover:underline"
          >
            Resend
          </button>
        </div>

        <Button
          type="submit"
          className="h-12 text-md font-semibold mt-8 w-full"
          disabled={fetchStatus === "fetching"}
        >
          {fetchStatus === "fetching" ? (
            <span className="flex items-center gap-2">
              Verifying...
              <Loader2 className="size-4 animate-spin" />
            </span>
          ) : (
            "Verify account"
          )}
        </Button>
      </form>
    </div>
  );
}
