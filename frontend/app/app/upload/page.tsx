"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { CloudUpload, Lock, Brain, Zap, Eye, EyeOff } from "lucide-react";

export default function UploadPage() {
  const { fetchApi } = useApi();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (jobId && (status === "processing" || status === "uploading")) {
      intervalId = setInterval(async () => {
        try {
          const jobRes = await fetchApi(`/jobs/${jobId}`);
          setProgress(jobRes.progress || 0);

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
          
          {/* Main Dropzone Area */}
          {(status === "idle" || status === "error") ? (
            <form onSubmit={handleUpload} className="w-full flex flex-col gap-6 items-center">
              
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
                  <CloudUpload className={`w-16 h-16 mb-4 ${file ? 'text-primary scale-110' : 'text-primary/70'} transition-transform`} strokeWidth={1.5} />
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
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            </form>
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-12 gap-8">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse"></div>
                <CloudUpload className="w-20 h-20 text-primary animate-bounce relative z-10" strokeWidth={1.5} />
              </div>
              
              <div className="w-full max-w-md flex flex-col items-center gap-3">
                <h3 className="text-xl font-bold font-display text-foreground">
                  {status === "uploading" ? "Uploading file..." : "Extracting transactions..."}
                </h3>
                <p className="text-sm font-medium text-primary">Stage 2 of 4 &bull; {progress}%</p>
                
                <div className="w-full h-3 bg-white/30 border border-white/40 rounded-full overflow-hidden shadow-inner mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {jobId && <p className="text-xs text-muted-foreground mt-2 opacity-50">Job ID: {jobId}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card bg-white/20 text-sm font-medium text-foreground shadow-sm animate-item delay-200">
            <Lock className="w-4 h-4 text-primary" />
            Bank-grade encryption
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card bg-white/20 text-sm font-medium text-foreground shadow-sm animate-item delay-300">
            <Brain className="w-4 h-4 text-accent" />
            AI-powered extraction
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card bg-white/20 text-sm font-medium text-foreground shadow-sm animate-item delay-400">
            <Zap className="w-4 h-4 text-success" />
            Results in ~60 seconds
          </div>
        </div>
      </div>
    </div>
  );
}
