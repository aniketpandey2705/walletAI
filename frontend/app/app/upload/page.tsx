"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  "Reading Statement",
  "Extracting Transactions",
  "Categorizing Merchants",
  "Building Analytics",
  "Preparing Dashboard"
];

export default function UploadPage() {
  const { fetchApi } = useApi();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (jobId && (status === "processing" || status === "uploading")) {
      intervalId = setInterval(async () => {
        try {
          const jobRes = await fetchApi(`/jobs/${jobId}`);
          setProgress(jobRes.progress || 0);

          // Simulate stages based on progress
          if (jobRes.progress < 20) setCurrentStage(0);
          else if (jobRes.progress < 50) setCurrentStage(1);
          else if (jobRes.progress < 75) setCurrentStage(2);
          else if (jobRes.progress < 95) setCurrentStage(3);
          else setCurrentStage(4);

          if (jobRes.status === "COMPLETED") {
            setStatus("done");
            clearInterval(intervalId);
            setTimeout(() => {
              router.push("/app/transactions");
            }, 1500);
          } else if (jobRes.status === "FAILED") {
            setStatus("error");
            clearInterval(intervalId);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, status, fetchApi, router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStatus("uploading");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bank_slug", "fino");
    if (password) formData.append("password", password);

    try {
      const res = await fetchApi("/upload", {
        method: "POST",
        body: formData,
      });
      setJobId(res.job_id);
      setStatus("processing");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full pt-8 pb-12 gap-8">
      <div className="flex flex-col items-center gap-2 text-center animate-item">
        <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">Upload Statement</h1>
        <p className="text-muted-foreground text-sm max-w-sm">Securely upload your bank statement PDF for AI analysis</p>
      </div>

      <div className="w-full max-w-2xl animate-item delay-100">
        <div className="glass-card shadow-[0_20px_60px_rgba(184,65,40,0.08)] p-6 sm:p-8 w-full flex flex-col items-center gap-8 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {(status === "idle" || status === "error") ? (
              <motion.form 
                key="upload-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleUpload} 
                className="w-full flex flex-col gap-6 items-center"
              >
                
                <div className="w-full relative group">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[20px] transition-all bg-white/20
                    ${file ? 'border-primary bg-primary/10' : 'border-primary/20 group-hover:border-primary/40 group-hover:bg-white/40'}
                  `}>
                    
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {file ? file.name : 'Drag and drop your PDF here'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'or click to browse files'}
                    </p>
                    <span className="px-3 py-1 bg-accent/20 text-accent-foreground text-accent text-xs font-semibold rounded-full border border-accent/10">
                      .pdf up to 10MB
                    </span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-2 relative">
                  <label className="text-sm font-semibold text-foreground ml-1">Password (if encrypted)</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex h-12 w-full rounded-xl border border-white/40 shadow-sm bg-white/30 backdrop-blur-md px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      placeholder="Enter statement password..."
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!file}
                  className="btn-liquid-glass w-full flex items-center justify-center gap-2 text-sm font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 text-foreground btn-click-anim h-14 px-8 mt-2"
                >
                  Analyse Statement &rarr;
                </button>
                
                {status === "error" && (
                  <div className="w-full p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium text-center border border-danger/20">
                    Upload or processing failed. Please try again.
                  </div>
                )}
              </motion.form>
            ) : (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex flex-col items-center justify-center py-6 gap-8"
              >
                <div className="relative flex items-center justify-center w-full max-w-sm">
                  {/* Progress Ring */}
                  
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-black font-display text-primary">{progress}%</span>
                  </div>
                </div>

                <div className="w-full max-w-sm flex flex-col gap-4 bg-white/30 p-6 rounded-2xl border border-white/40 shadow-sm">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = currentStage > idx;
                    const isActive = currentStage === idx;
                    const isPending = currentStage < idx;

                    return (
                      <div key={idx} className={`flex items-center gap-4 transition-all duration-300 ${isActive ? 'opacity-100' : (isCompleted ? 'opacity-70' : 'opacity-40')}`}>
                         {isCompleted ? (
                           <div className="w-5 h-5 rounded-full border-2 border-success shrink-0" />
                         ) : isActive ? (
                           <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent shrink-0 animate-spin" />
                         ) : (
                           <div className="w-5 h-5 rounded-full border-2 border-foreground/20 shrink-0" />
                         )}
                         <span className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{stage}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card bg-white/20 text-sm font-medium text-foreground shadow-sm animate-item delay-200">
            
            Bank-grade encryption
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card bg-white/20 text-sm font-medium text-foreground shadow-sm animate-item delay-300">
            
            AI-powered extraction
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card bg-white/20 text-sm font-medium text-foreground shadow-sm animate-item delay-400">
            
            Results in ~60 seconds
          </div>
        </div>
      </div>
    </div>
  );
}
