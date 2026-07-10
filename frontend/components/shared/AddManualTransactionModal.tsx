"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useManualTransactions } from "@/lib/hooks/useManualTransactions";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2 } from "lucide-react";

export function AddManualTransactionModal() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: accounts, createAccount } = useAccounts();
  const { createTransaction } = useManualTransactions();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState("DEBIT");
  const [accountId, setAccountId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-select first manual account if available
  const manualAccounts = accounts?.filter(a => ["cash", "wallet", "manual"].includes(a.account_type)) || [];
  
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [newAccName, setNewAccName] = useState("Cash on Hand");
  const [newAccBal, setNewAccBal] = useState("0");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open]);

  useEffect(() => {
    if (manualAccounts.length > 0 && !accountId) {
      setAccountId(manualAccounts[0].id);
    }
  }, [manualAccounts, accountId]);

  if (!mounted) return null;

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const acc = await createAccount({
        display_name: newAccName,
        account_type: "cash",
        starting_balance: parseFloat(newAccBal || "0")
      });
      setAccountId(acc.id);
      setCreatingAccount(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!accountId || !description || !amount) return;
    setLoading(true);
    try {
      await createTransaction({
        account_id: accountId,
        txn_date: date,
        description,
        amount: parseFloat(amount),
        direction,
        notes
      });
      setOpen(false);
      setDescription("");
      setAmount("");
      setNotes("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 9999 }} role="dialog" aria-modal="true" tabIndex={-1}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-[425px] bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6 sm:p-8 flex flex-col gap-6"
          >
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
              <h2 className="text-[18px] font-medium text-[var(--foreground)] tracking-tight">Add Manual Transaction</h2>
              <button 
                onClick={() => setOpen(false)}
                className="p-1.5 -mr-1.5 -mt-1.5 text-[var(--secondary-text)] hover:bg-[var(--hover)] hover:text-[var(--foreground)] rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {manualAccounts.length === 0 || creatingAccount ? (
              <div className="flex flex-col gap-4 pt-2">
                <p className="text-[13px] text-[var(--secondary-text)] leading-relaxed">
                  You need a manual account (like Cash or Wallet) to log this. Let's create one.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--foreground)]">Account Name</label>
                  <input 
                    type="text" 
                    value={newAccName} 
                    onChange={(e) => setNewAccName(e.target.value)} 
                    placeholder="e.g. Cash on Hand" 
                    className="input-base"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--foreground)]">Starting Balance (Optional)</label>
                  <input 
                    type="number" 
                    value={newAccBal} 
                    onChange={(e) => setNewAccBal(e.target.value)} 
                    className="input-base"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  {manualAccounts.length > 0 && (
                    <button className="btn-ghost flex-1" onClick={() => setCreatingAccount(false)}>Cancel</button>
                  )}
                  <button className="btn-primary flex-1 h-9" onClick={handleCreateAccount} disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Create Account"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--foreground)]">Account</label>
                  <select 
                    value={accountId} 
                    onChange={(e) => setAccountId(e.target.value)}
                    className="input-base appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select account</option>
                    {manualAccounts.map(a => (
                      <option key={a.id} value={a.id}>{a.display_name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--foreground)]">Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="input-base"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--foreground)]">Description</label>
                  <input 
                    type="text"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="What was this for?" 
                    className="input-base"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-[var(--foreground)]">Amount (₹)</label>
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      placeholder="0.00" 
                      className="input-base mono-num"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-[var(--foreground)]">Direction</label>
                    <select 
                      value={direction} 
                      onChange={(e) => setDirection(e.target.value)}
                      className="input-base appearance-none cursor-pointer"
                    >
                      <option value="DEBIT">Expense (Debit)</option>
                      <option value="CREDIT">Income (Credit)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--foreground)]">Notes (Optional)</label>
                  <input 
                    type="text"
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    className="input-base"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-2">
                  <button 
                    onClick={() => setCreatingAccount(true)} 
                    className="text-[12px] text-[var(--primary)] hover:underline font-medium"
                  >
                    + New Account
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={loading || !accountId || !description || !amount}
                    className="btn-primary min-w-[120px] h-9"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Entry"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium">
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Add Cash/Manual Entry</span>
        <span className="sm:hidden">Add Manual</span>
      </button>
      {createPortal(modalContent, document.body)}
    </>
  );
}
