import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();

  // If already signed in, redirect to app
  if (userId) {
    redirect("/app/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <span className="font-bold text-xl">WalletDNA 🧬</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="/sign-in"
          >
            Log in
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center bg-muted/40">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Understand Your Bank Statements
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Upload your Fino Payments Bank PDF. Our AI automatically extracts, categorizes, and gives you deep financial insights in seconds.
            </p>
          </div>
          <div className="space-x-4">
            <Link
              href="/sign-up"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
