"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, FileText, Bot, PencilLine, Info, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: string;
  description: string;
  merchant_name?: string;
  category_id?: string;
  category_name?: string;
  category_source?: string;
  ai_confidence?: number;
  reason?: string;
}

interface TransactionDetailsModalProps {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  categories: Category[];
  onSave: (merchantName: string, categoryId: string) => Promise<void>;
}

export function TransactionDetailsModal({ open, onClose, transaction, categories, onSave }: TransactionDetailsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [merchantInput, setMerchantInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (transaction) {
      setMerchantInput(transaction.merchant_name || "");
      setCategoryInput(transaction.category_id || "");
      setNotesInput(""); 
      setShowNotes(false);
    }
  }, [transaction]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, onClose]);

  if (!mounted) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(merchantInput, categoryInput);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (transaction?.description) {
      navigator.clipboard.writeText(transaction.description);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getConfidenceData = (confidence?: number, source?: string) => {
    if (!confidence && source !== 'user' && source !== 'memory') {
      return { val: 0, text: "Unknown", bg: "bg-red-50", textCol: "text-red-600", bar: "bg-red-500" };
    }
    const val = (source === 'user' || source === 'memory') ? 100 : (confidence || 0);
    if (val >= 95) return { val, text: `${val}%`, bg: "bg-emerald-50", textCol: "text-emerald-600", bar: "bg-emerald-500" };
    if (val >= 80) return { val, text: `${val}%`, bg: "bg-amber-50", textCol: "text-amber-600", bar: "bg-amber-500" };
    return { val, text: `${val}%`, bg: "bg-red-50", textCol: "text-red-600", bar: "bg-red-500" };
  };

  const confData = transaction ? getConfidenceData(transaction.ai_confidence, transaction.category_source) : null;

  const modalContent = (
    <AnimatePresence>
      {open && transaction && (
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 9999 }} role="dialog" aria-modal="true" tabIndex={-1}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px] cursor-pointer"
          />
          
          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-[760px] bg-white rounded-[18px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] p-6 md:p-8 flex flex-col gap-6"
          >
            {/* Top Close Button & Date */}
            <div className="flex items-center justify-between absolute top-5 left-8 right-5">
              <span className="text-[13px] font-medium text-slate-500">{transaction.date}</span>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-150 hover:rotate-45"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center pt-5 pb-1 gap-1.5">
              <span className={`text-[60px] leading-none font-extrabold tracking-tighter ${transaction.type === "CREDIT" ? "text-emerald-600" : "text-slate-900"}`}>
                {transaction.type === "CREDIT" ? "+" : "-"}₹{Number(transaction.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
              <span className="text-[20px] font-extrabold text-slate-900 mt-1">{transaction.merchant_name || "Unknown"}</span>
              <span className="inline-flex items-center px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-slate-50 text-slate-500 mt-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-slate-100 transition-colors duration-150">
                {transaction.category_name || "Uncategorized"}
              </span>
            </div>

            {/* 12-Column Grid */}
            <div className="grid grid-cols-12 gap-5 mt-1">
              
              {/* Left Column: Raw Description */}
              <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-widest">Raw Transaction</span>
                </div>
                <div className="group relative bg-white border border-slate-200 shadow-sm rounded-[14px] p-4 h-full flex items-start transition-colors hover:bg-slate-50/50 duration-150">
                  <p className="font-mono text-[13px] text-slate-700 break-words leading-loose pr-8 w-full mt-0.5">
                    {transaction.description}
                  </p>
                  <button 
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-1.5 rounded-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all duration-150 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Copy description"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Right Column: AI Analysis */}
              <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <Bot className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-widest">AI Analysis</span>
                </div>
                <div className="bg-white border border-slate-200 shadow-sm rounded-[14px] p-4 flex flex-col justify-center gap-4 h-full transition-colors hover:bg-slate-50/50 duration-150">
                  
                  {/* Row 1 */}
                  <div className="flex items-center justify-between h-[24px]">
                    <span className="text-[14px] text-slate-500 font-medium">Merchant</span>
                    <span className="text-[15px] font-semibold text-slate-900">{transaction.merchant_name || "Unknown"}</span>
                  </div>
                  
                  {/* Row 2 */}
                  <div className="flex items-center justify-between h-[24px]">
                    <span className="text-[14px] text-slate-500 font-medium">Category</span>
                    <span className="text-[15px] font-semibold text-slate-900">{transaction.category_name || "Uncategorized"}</span>
                  </div>
                  
                  {/* Row 3 */}
                  <div className="flex items-center justify-between h-[24px]">
                    <span className="text-[14px] text-slate-500 font-medium">Confidence</span>
                    <div className="flex flex-col items-end justify-center gap-1.5 w-[110px]">
                      {confData && (
                        <>
                          <div className="flex items-center justify-end w-full">
                            <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-bold tracking-wide ${confData.bg} ${confData.textCol}`}>
                              {confData.text}
                            </span>
                          </div>
                          <div className="w-full h-[4px] bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${confData.bar}`} style={{ width: `${confData.val}%` }} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Correction Form */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <PencilLine className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[12px] font-semibold text-slate-600 uppercase tracking-widest">Correct Classification</span>
                </div>
                {transaction.category_source === 'user' && (
                  <span className="text-[11px] font-semibold text-orange-500">User Corrected</span>
                )}
              </div>
              
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5">
                  <input 
                    type="text" 
                    value={merchantInput}
                    onChange={(e) => setMerchantInput(e.target.value)}
                    placeholder="Merchant" 
                    className="flex-1 h-[44px] bg-slate-50 rounded-[10px] border border-slate-200 px-3.5 text-[14px] text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-[3px] focus:ring-orange-500/15 transition-all duration-150 placeholder:text-slate-400 hover:border-slate-300"
                  />
                  <select 
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="flex-1 h-[44px] bg-slate-50 rounded-[10px] border border-slate-200 px-3.5 text-[14px] text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-[3px] focus:ring-orange-500/15 transition-all duration-150 appearance-none cursor-pointer placeholder:text-slate-400 hover:border-slate-300"
                  >
                    <option value="" disabled className="text-slate-400">Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-[44px] px-8 rounded-[10px] bg-gradient-to-b from-orange-500 to-orange-600 text-white font-semibold text-[14px] shadow-[0_2px_8px_rgba(234,88,12,0.25)] hover:shadow-[0_4px_12px_rgba(234,88,12,0.35)] hover:-translate-y-[2px] active:scale-[0.98] active:translate-y-[1px] transition-all duration-180 flex items-center justify-center shrink-0 disabled:opacity-60"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                  </button>
                </div>
                
                {/* Expandable Notes */}
                {!showNotes ? (
                  <button onClick={() => setShowNotes(true)} className="text-[12px] text-slate-400 hover:text-slate-600 self-start font-medium transition-colors px-1">
                    + Add note
                  </button>
                ) : (
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Add a note..."
                    className="w-full h-20 bg-slate-50 rounded-[10px] border border-slate-200 px-3.5 py-2.5 text-[13px] text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-[3px] focus:ring-orange-500/15 transition-all hover:border-slate-300 resize-none"
                  />
                )}
              </div>
            </div>

            {/* Footer Banner */}
            <div className="flex items-center justify-center gap-2 h-[32px] rounded-[10px] bg-slate-50 mt-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-500">Corrections help ERIS learn and improve future categorization.</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
