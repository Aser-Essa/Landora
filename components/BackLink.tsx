import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ComponentProps } from "react";

type BackLinkProps = {
  children: React.ReactNode;
} & Pick<ComponentProps<typeof Link>, "href">;

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="group mb-4 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft
        size={16}
        className="translate-y-[-1.5px] transition-transform group-hover:-translate-x-0.5"
      />
      <span>{children}</span>
    </Link>
  );
}
