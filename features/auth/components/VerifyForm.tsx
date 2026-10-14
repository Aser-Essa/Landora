"use client";

import InputField from "@/components/InputField";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { verifySchema } from "../schemas";
import { VerifyFormValues } from "../types";

type Props = {
  handleVerify: (data: VerifyFormValues) => Promise<void>;
  sendEmailCode: () => void;
  fetchStatus: "idle" | "fetching";
  onBack: () => void;
};

export default function VerifyForm({
  handleVerify,
  sendEmailCode,
  onBack,
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
        <button
          className="group mb-4 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          onClick={onBack}
        >
          <ChevronLeft
            size={16}
            className="translate-y-[-1.5px] transition-transform group-hover:-translate-x-0.5"
          />
          <span>
            {pathname === "/sign-up" ? "Back to signup" : "Back to login"}
          </span>
        </button>

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
