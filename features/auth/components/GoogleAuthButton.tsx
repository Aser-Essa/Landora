import React from "react";
import { SocialAuthButton } from "./SocialAuthButton";
import Image from "next/image";

export default function GoogleAuthButton({
  mode,
}: {
  mode: "signin" | "signup";
}) {
  return (
    <SocialAuthButton strategy="oauth_google" mode={mode}>
      <div className=" relative size-4.5">
        <Image src={"/google.svg"} fill alt="google icon" />
      </div>
      <p> {mode === "signin" ? "Sign in" : "Sign up"} with Google</p>
    </SocialAuthButton>
  );
}
