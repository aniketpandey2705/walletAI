"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Loader2 } from "lucide-react";

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

  const getConfidenceText = (confidence?: number, source?: string) => {
    if (!confidence && source !== 'user' && source !== 'memory') return "Unknown";
    const val = (source === 'user' || source === 'memory') ? 100 : (confidence || 0);
    if (val >= 95) return `High (${val}%)`;
    if (val >= 80) return `Medium (${val}%)`;
    return `Low (${val}%)`;
  };

  const modalContent = (
    <AnimatePresence>
      {open && transaction && (
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 9999 }} role="dialog" aria-modal="true" tabIndex={-1}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer"
          />
          
          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-[600px] bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border)] p-8 flex flex-col gap-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-[var(--secondary-text)]">{transaction.date}</span>
                <span className={`text-3xl font-medium tracking-tight tabular-nums ${transaction.type === "CREDIT" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                  {transaction.type === "CREDIT" ? "+" : "-"}₹{Number(transaction.amount).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 -mt-2 text-[var(--secondary-text)] hover:bg-[var(--hover)] rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Grid */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-4 border-b border-[var(--border)] pb-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Merchant</span>
                  <span className="text-[14px] text-[var(--foreground)] font-medium">{transaction.merchant_name || "Unknown"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Category</span>
                  <span className="text-[14px] text-[var(--foreground)]">{transaction.category_name || "Uncategorized"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Confidence</span>
                  <span className="text-[14px] text-[var(--foreground)]">{getConfidenceText(transaction.ai_confidence, transaction.category_source)}</span>
                </div>
              </div>

              {/* Raw Transaction */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Statement Description</span>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] hover:text-[var(--primary)] transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="font-mono text-[12px] text-[var(--foreground)] bg-[var(--background)] p-3 rounded-md border border-[var(--border)]">
                  {transaction.description}
                </p>
              </div>
            </div>

            {/* Edit Section */}
            <div className="flex flex-col gap-4 bg-[var(--background)] -mx-8 -mb-8 p-8 border-t border-[var(--border)] rounded-b-xl">
              <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Update Details</span>
              
              <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
                <input 
                  type="text" 
                  value={merchantInput}
                  onChange={(e) => setMerchantInput(e.target.value)}
                  placeholder="Merchant" 
                  className="input-base"
                />
                <select 
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="input-base appearance-none"
                >
                  <option value="" disabled>Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary min-w-[80px]"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
              </div>
              
              {!showNotes ? (
                <button 
                  onClick={() => setShowNotes(true)} 
                  className="text-[12px] text-[var(--secondary-text)] hover:text-[var(--primary)] text-left w-fit transition-colors"
                >
                  + Add note
                </button>
              ) : (
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full h-20 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-[13px] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors resize-none mt-2"
                />
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
