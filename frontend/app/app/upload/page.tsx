"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
            }, 1000);
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
    <div className="flex flex-col gap-10 max-w-2xl mx-auto w-full px-6 py-12">
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-8 text-center">
        <h1 className="text-[28px] font-medium text-[var(--foreground)] tracking-tight leading-none">Upload Statement</h1>
        <p className="text-[14px] text-[var(--secondary-text)]">Securely upload your bank statement PDF for analysis.</p>
      </div>

      <div className="w-full">
        {(status === "idle" || status === "error") ? (
          <form 
            onSubmit={handleUpload} 
            className="w-full flex flex-col gap-6"
          >
            <div className="w-full relative group">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full flex flex-col items-center justify-center py-16 border border-dashed rounded-lg transition-colors
                ${file ? 'border-[var(--primary)] bg-[var(--hover)]' : 'border-[var(--border)] group-hover:border-[var(--primary)] bg-transparent'}
              `}>
                <h3 className="text-[14px] font-medium text-[var(--foreground)] mb-1">
                  {file ? file.name : 'Select or drop PDF file'}
                </h3>
                <p className="text-[13px] text-[var(--secondary-text)]">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Max 10MB limit'}
                </p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Password (If Encrypted)</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-base"
                  placeholder="Statement password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] hover:text-[var(--primary)] transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={!file}
              className="btn-primary w-full mt-2"
            >
              Upload and Analyze
            </button>
            
            {status === "error" && (
              <div className="w-full py-2 text-center text-[13px] text-rose-700 font-medium">
                Upload or processing failed. Please try again.
              </div>
            )}
          </form>
        ) : (
          <div className="w-full flex flex-col items-center py-12 gap-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[40px] font-medium tracking-tight tabular-nums text-[var(--primary)]">{progress}%</span>
              <span className="text-[13px] text-[var(--secondary-text)]">Processing statement...</span>
            </div>

            <div className="w-full max-w-sm flex flex-col gap-3">
              {STAGES.map((stage, idx) => {
                const isCompleted = currentStage > idx;
                const isActive = currentStage === idx;
                
                return (
                  <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${isActive || isCompleted ? 'opacity-100' : 'opacity-30'}`}>
                     {isCompleted ? (
                       <div className="w-4 h-4 rounded-full border border-[var(--primary)] bg-[var(--primary)] shrink-0" />
                     ) : isActive ? (
                       <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)] shrink-0" />
                     ) : (
                       <div className="w-4 h-4 rounded-full border border-[var(--border)] shrink-0" />
                     )}
                     <span className={`text-[13px] ${isActive || isCompleted ? 'text-[var(--foreground)] font-medium' : 'text-[var(--muted-text)]'}`}>{stage}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-6 mt-4">
        {['Encrypted', 'AI Extraction', '~60s Processing'].map((feature, i) => (
          <span key={i} className="text-[11px] uppercase tracking-wider font-medium text-[var(--muted-text)]">
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}
