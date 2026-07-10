"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";

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
      <div className="flex min-h-screen w-full items-center justify-center bg-[var(--background)] px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-sm space-y-6 bg-[var(--surface)] p-10 rounded-2xl border border-[var(--border)] shadow-sm text-center"
        >
          <div className="space-y-2">
            <h2 className="text-2xl font-medium tracking-tight text-[var(--foreground)]">Check your email</h2>
            <p className="text-[14px] text-[var(--secondary-text)] leading-relaxed">
              We sent a confirmation link to <strong className="text-[var(--foreground)] font-medium">{email}</strong>. Please click the link to finish signing up.
            </p>
          </div>
          <div className="pt-4">
            <Link 
              href="/sign-in" 
              className="btn-secondary w-full justify-center h-10 inline-flex items-center"
            >
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-medium tracking-tight text-[var(--foreground)]">Create an account</h2>
            <p className="text-[14px] text-[var(--secondary-text)]">
              Enter your details to get started.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSignUp} className="space-y-5">
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
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>
        
        <div className="text-center text-[13px] text-[var(--secondary-text)] pt-2">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[var(--foreground)] font-medium hover:text-[var(--primary)] transition-colors">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
