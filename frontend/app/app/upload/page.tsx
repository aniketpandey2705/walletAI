"use client";

import { useState } from "react";
import { useApi } from "@/lib/api";

export default function UploadPage() {
  const { fetchApi } = useApi();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [jobId, setJobId] = useState<string | null>(null);

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
      // In a real app, we'd start polling the /jobs/jobId endpoint here
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Upload Statement</h1>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
        
        {status === "idle" || status === "error" ? (
          <form onSubmit={handleUpload} className="flex flex-col gap-4 w-full max-w-md">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Bank Statement PDF</label>
              <input 
                type="file" 
                accept=".pdf,.csv" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">PDF Password (if any)</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Fino: DOB(DDMMYYYY) or Mobile"
              />
            </div>

            <button 
              type="submit"
              disabled={!file}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
            >
              Upload & Process
            </button>
            {status === "error" && <p className="text-red-500 text-sm mt-2 text-center">Upload failed. Please try again.</p>}
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <h3 className="text-xl font-bold">
              {status === "uploading" ? "Uploading file..." : "Processing statement..."}
            </h3>
            <p className="text-muted-foreground text-sm">Job ID: {jobId}</p>
          </div>
        )}
      </div>
    </>
  );
}
