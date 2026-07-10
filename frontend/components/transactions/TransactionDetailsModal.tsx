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
  ai_confidence?: number;
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
            className="relative w-full max-w-[500px] bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-8 flex flex-col gap-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-[var(--secondary-text)] mono-num">{transaction.date}</span>
                <span className={`text-4xl font-medium tracking-tight mono-num ${transaction.type === "CREDIT" ? "text-[var(--success)]" : "text-[var(--foreground)]"}`}>
                  {transaction.type === "CREDIT" ? "+" : "-"}₹{Number(transaction.amount).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 -mr-1.5 -mt-1.5 text-[var(--secondary-text)] hover:bg-[var(--hover)] hover:text-[var(--foreground)] rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Raw Transaction */}
            <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-6">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-medium text-[var(--foreground)]">Bank statement description</span>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--secondary-text)] hover:text-[var(--primary)] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="font-mono text-[13px] text-[var(--secondary-text)] bg-[var(--background)] p-3 rounded-md border border-[var(--border)]">
                {transaction.description}
              </p>
            </div>

            {/* Edit Section */}
            <div className="flex flex-col gap-4 -mt-2">
              <span className="text-[14px] font-medium text-[var(--foreground)]">Classification</span>
              
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[var(--secondary-text)]">Merchant</label>
                  <input 
                    type="text" 
                    value={merchantInput}
                    onChange={(e) => setMerchantInput(e.target.value)}
                    placeholder="Merchant name" 
                    className="input-base"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[12px] text-[var(--secondary-text)]">Category</label>
                    {transaction.ai_confidence && (
                      <span className="text-[11px] text-[var(--muted-text)] font-medium">ERIS <span className="mono-num">{transaction.ai_confidence}%</span></span>
                    )}
                  </div>
                  <select 
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="input-base appearance-none"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              
              {!showNotes ? (
                <button 
                  onClick={() => setShowNotes(true)} 
                  className="text-[13px] text-[var(--secondary-text)] hover:text-[var(--primary)] text-left w-fit transition-colors mt-1"
                >
                  Add a note...
                </button>
              ) : (
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[12px] text-[var(--secondary-text)]">Note</label>
                  <textarea
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="E.g., Team lunch..."
                    className="w-full h-20 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary min-w-[100px] h-9"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
