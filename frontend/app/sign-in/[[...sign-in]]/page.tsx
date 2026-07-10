"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/app/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--background)] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm space-y-8 bg-[var(--surface)] p-10 rounded-2xl border border-[var(--border)] shadow-sm"
      >
        <div className="text-center space-y-6 flex flex-col items-center">
          <img src="/black logo.png" alt="ERIS Logo" className="h-12 w-auto object-contain mx-auto" />
          <div className="space-y-1.5">
            <h2 className="text-2xl font-medium tracking-tight text-[var(--foreground)]">Sign in</h2>
            <p className="text-[14px] text-[var(--secondary-text)]">
              Continue to your account.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[var(--foreground)]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-base w-full h-10"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-[var(--foreground)]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base w-full h-10"
              />
            </div>
          </div>

          {error && (
            <div className="text-[13px] text-[var(--danger)] bg-red-50/50 border border-red-100 rounded-md p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center h-10"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        
        <div className="text-center text-[13px] text-[var(--secondary-text)] pt-2">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-[var(--foreground)] font-medium hover:text-[var(--primary)] transition-colors">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
