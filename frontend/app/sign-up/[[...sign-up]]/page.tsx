"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40 px-4">
        <div className="w-full max-w-md space-y-4 rounded-xl border bg-background p-10 shadow-lg text-center">
          <h2 className="text-3xl font-bold tracking-tight">Check your email</h2>
          <p className="text-muted-foreground">
            We sent a confirmation link to <strong>{email}</strong>. Please click the link to finish signing up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-background p-10 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and password to sign up for WalletDNA.
          </p>
        </div>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          {error && <div className="text-sm font-medium text-red-500">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
