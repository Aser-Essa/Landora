import { Button } from "@/components/ui/button";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useState } from "react";

type SocialSignUpProps = {
  strategy: "oauth_google";
  children: React.ReactNode;
  mode: "signup" | "signin";
};

export function SocialAuthButton({
  strategy,
  mode,
  children,
}: SocialSignUpProps) {
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();

  const action = mode === "signup" ? signUp : signIn;

  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    await action.reset();

    setLoading(true);
    try {
      await action.sso({
        strategy,
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: "/sso-callback",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={"outline"}
      type="button"
      className="h-12 flex items-center gap-2 text-md"
    >
      {children}
    </Button>
  );
}
