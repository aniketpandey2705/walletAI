"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
};

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
      <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 overflow-hidden">
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.015) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.015) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Dynamic Background Orbs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-100/40 blur-[120px]" />
          <div className="absolute top-[20%] right-[-10%] w-[45%] h-[60%] rounded-full bg-amber-50/50 blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[10%] w-[60%] h-[50%] rounded-full bg-slate-100/40 blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="z-10 w-full max-w-md space-y-6 rounded-[28px] bg-white/40 backdrop-blur-[40px] backdrop-saturate-[2] p-10 text-center"
          style={{
            boxShadow: "inset 0 1.5px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 1px rgba(0, 0, 0, 0.05), 0 16px 48px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
          }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-display">Check your email</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Please click the link to finish signing up.
          </p>
          <div className="pt-2 flex justify-center">
            <Link 
              href="/sign-in" 
              className="flex items-center justify-center bg-primary text-white font-semibold py-2.5 px-6 rounded-full hover:bg-primary/95 hover:scale-[1.01] btn-click-anim cursor-pointer transition-all duration-300"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(37, 99, 237, 0.25)",
                border: "1px solid rgba(0, 0, 0, 0.15)",
              }}
            >
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 overflow-hidden">
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Dynamic Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-100/40 blur-[120px]" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[20%] right-[-10%] w-[45%] h-[60%] rounded-full bg-amber-50/50 blur-[100px]" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.08, 1],
            x: [0, 15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-20%] left-[10%] w-[60%] h-[50%] rounded-full bg-slate-100/40 blur-[120px]" 
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 w-full max-w-md space-y-8 rounded-[28px] bg-white/40 backdrop-blur-[40px] backdrop-saturate-[2] p-10"
        style={{
          boxShadow: "inset 0 1.5px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 1px rgba(0, 0, 0, 0.05), 0 16px 48px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
        }}
      >
        <motion.div variants={itemVariants} className="text-center space-y-4 flex flex-col items-center">
          <img src="/black logo.png" alt="ERIS Logo" className="h-16 w-auto object-contain mx-auto rounded-xl" />
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-display">Create an account</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign up for ERIS.
          </p>
        </motion.div>
        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-4">
            <motion.div variants={itemVariants}>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email address</label>
              <div className="relative mt-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="flex h-11 w-full rounded-xl bg-white/50 px-4 py-2 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  style={{
                    boxShadow: "inset 0 1.5px 3px rgba(0, 0, 0, 0.06), inset 0 -1px 0 rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
              <div className="relative mt-2">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-xl bg-white/50 px-4 py-2 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                  style={{
                    boxShadow: "inset 0 1.5px 3px rgba(0, 0, 0, 0.06), inset 0 -1px 0 rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                />
              </div>
            </motion.div>
          </div>

          {error && (
            <motion.div 
              variants={itemVariants}
              className="text-sm font-medium text-red-500 bg-red-50 border border-red-200/50 rounded-xl p-3"
            >
              {error}
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center bg-primary text-white font-semibold py-3 px-4 rounded-full hover:bg-primary/95 hover:scale-[1.01] btn-click-anim disabled:opacity-50 cursor-pointer transition-all duration-300"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(37, 99, 237, 0.25)",
                border: "1px solid rgba(0, 0, 0, 0.15)",
              }}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </motion.div>
        </form>
        <motion.div variants={itemVariants} className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-primary hover:underline transition-all">
            Sign in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
