import Link from "next/link";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col  p-6 md:p-10 bg-muted">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            className="flex text-2xl items-center gap-2 font-semibold"
          >
            <span>
              <span className="text-primary">L</span>andora
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg">{children}</div>
        </div>
      </div>
      <div className="relative hidden bg-muted-foreground/15 lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
