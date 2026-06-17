"use client";

import { useState } from "react";
import { CheckCircle, Mail, AlertCircle, Info, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Mode = "credit" | "resend" | "reverse";

interface Result {
  success: boolean;
  action?: string;
  transaction?: { _id: string; amount: number; orderId: string; description: string };
  amount?: number;
  error?: string;
}

const inputCls =
  "w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors";

export default function AdminCommissionsPage() {
  const [mode, setMode] = useState<Mode>("credit");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // Credit form
  const [affiliateEmail, setAffiliateEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [amount, setAmount] = useState("17500");
  const [productName, setProductName] = useState("Averis Academy");

  // Reverse form
  const [reverseId, setReverseId] = useState("");
  const [reverseConfirm, setReverseConfirm] = useState(false);

  // Resend-only form
  const [resendEmail, setResendEmail] = useState("");
  const [resendBuyerName, setResendBuyerName] = useState("");
  const [resendTransactionId, setResendTransactionId] = useState("");
  const [resendAmount, setResendAmount] = useState("17500");
  const [resendProduct, setResendProduct] = useState("Averis Academy");

  async function handleCredit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateEmail, buyerName, amount: Number(amount), productName }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setAffiliateEmail("");
        setBuyerName("");
        setAmount("17500");
        setProductName("Averis Academy");
      }
    } catch {
      setResult({ success: false, error: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateEmail: resendEmail,
          buyerName: resendBuyerName,
          amount: Number(resendAmount),
          productName: resendProduct,
          emailOnly: true,
          transactionId: resendTransactionId,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setResendEmail("");
        setResendBuyerName("");
        setResendTransactionId("");
      }
    } catch {
      setResult({ success: false, error: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleReverse(e: React.FormEvent) {
    e.preventDefault();
    if (!reverseConfirm) { setResult({ success: false, error: "Please tick the confirmation checkbox first." }); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/commissions?id=${encodeURIComponent(reverseId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      setResult(data);
      if (data.success) { setReverseId(""); setReverseConfirm(false); }
    } catch {
      setResult({ success: false, error: "Network error — please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Manual Commission Tool</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Credit commissions and resend emails for affiliates who were missed due to the payment caching bug.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-warning/10 border border-warning/20 rounded-xl px-4 py-3">
        <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          <p className="font-semibold">When to use this</p>
          <p className="text-muted-foreground mt-0.5">
            Use <strong>Credit Commission</strong> for affiliates missed entirely.
            Use <strong>Resend Email</strong> if the commission exists but the email failed.
            Use <strong>Reverse Commission</strong> to delete a duplicate that was credited twice.
          </p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setMode("credit"); setResult(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            mode === "credit" ? "bg-secondary text-white" : "bg-muted text-muted-foreground hover:bg-border"
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          Credit Commission
        </button>
        <button
          onClick={() => { setMode("resend"); setResult(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            mode === "resend" ? "bg-secondary text-white" : "bg-muted text-muted-foreground hover:bg-border"
          }`}
        >
          <Mail className="h-4 w-4" />
          Resend Email
        </button>
        <button
          onClick={() => { setMode("reverse"); setResult(null); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            mode === "reverse" ? "bg-danger text-white" : "bg-muted text-muted-foreground hover:bg-border"
          }`}
        >
          <Trash2 className="h-4 w-4" />
          Reverse Commission
        </button>
      </div>

      {/* Result banner */}
      {result && (
        <div className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${
          result.success
            ? "bg-success/10 border-success/20"
            : "bg-danger/10 border-danger/20"
        }`}>
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
          )}
          <div className="text-sm">
            {result.success && result.action === "credited" && result.transaction && (
              <>
                <p className="font-semibold text-success">Commission credited successfully</p>
                <p className="text-muted-foreground mt-0.5">
                  {formatCurrency(result.transaction.amount)} added · Order ID: <span className="font-mono">{result.transaction.orderId}</span>
                </p>
                <p className="text-muted-foreground text-xs mt-1">Transaction ID: <span className="font-mono">{result.transaction._id}</span></p>
              </>
            )}
            {result.success && result.action === "email_resent" && (
              <p className="font-semibold text-success">Commission email resent successfully</p>
            )}
            {result.success && result.action === "reversed" && (
              <>
                <p className="font-semibold text-success">Commission reversed and deleted</p>
                {result.amount && <p className="text-muted-foreground mt-0.5">{formatCurrency(result.amount)} removed from affiliate&apos;s balance</p>}
              </>
            )}
            {!result.success && (
              <p className="text-danger">{result.error || "Something went wrong."}</p>
            )}
          </div>
        </div>
      )}

      {mode === "credit" ? (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Credit Commission + Send Email</h2>
            <p className="text-xs text-muted-foreground">Creates a new pending commission transaction and sends the affiliate their commission notification email.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCredit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Affiliate Email <span className="text-danger">*</span></label>
                <input
                  type="email"
                  value={affiliateEmail}
                  onChange={(e) => setAffiliateEmail(e.target.value)}
                  placeholder="affiliate@email.com"
                  className={inputCls}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Email of the affiliate who should receive the commission</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Buyer Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="John Doe"
                  className={inputCls}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Name of the person who made the purchase</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Commission Amount (₦) <span className="text-danger">*</span></label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="17500"
                  className={inputCls}
                  required
                  min={1}
                />
                <p className="text-xs text-muted-foreground mt-1">Default: ₦17,500 (new subscription) · ₦15,000 (renewal)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Averis Academy"
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-secondary text-white font-semibold text-sm rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Processing…" : "Credit Commission & Send Email"}
              </button>
            </form>
          </CardContent>
        </Card>
      ) : mode === "resend" ? (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Resend Commission Email Only</h2>
            <p className="text-xs text-muted-foreground">Sends the commission notification email for an existing transaction. Use this if the commission was credited but the email bounced or was never delivered.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResend} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Transaction ID <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={resendTransactionId}
                  onChange={(e) => setResendTransactionId(e.target.value)}
                  placeholder="MongoDB ObjectId of the commission transaction"
                  className={`${inputCls} font-mono`}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Find this in MongoDB or from the Credit Commission tool above</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Affiliate Email <span className="text-danger">*</span></label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="affiliate@email.com"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Buyer Name <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={resendBuyerName}
                  onChange={(e) => setResendBuyerName(e.target.value)}
                  placeholder="John Doe"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Commission Amount (₦)</label>
                <input
                  type="number"
                  value={resendAmount}
                  onChange={(e) => setResendAmount(e.target.value)}
                  placeholder="17500"
                  className={inputCls}
                  min={1}
                />
                <p className="text-xs text-muted-foreground mt-1">Used in the email body — should match the actual transaction amount</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={resendProduct}
                  onChange={(e) => setResendProduct(e.target.value)}
                  placeholder="Averis Academy"
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-secondary text-white font-semibold text-sm rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Resend Commission Email"}
              </button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground text-danger">Reverse Commission</h2>
            <p className="text-xs text-muted-foreground">Permanently deletes a commission transaction. Use this to remove a duplicate that was credited twice.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReverse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Transaction ID to Delete <span className="text-danger">*</span></label>
                <input
                  type="text"
                  value={reverseId}
                  onChange={(e) => setReverseId(e.target.value)}
                  placeholder="MongoDB ObjectId of the duplicate commission"
                  className={`${inputCls} font-mono`}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">You can find this in the Transaction ID shown after crediting, or look it up in MongoDB</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reverseConfirm}
                  onChange={(e) => setReverseConfirm(e.target.checked)}
                  className="mt-0.5 accent-danger"
                />
                <span className="text-xs text-foreground">I confirm this is a duplicate commission and I want to permanently delete it</span>
              </label>

              <button
                type="submit"
                disabled={loading || !reverseConfirm}
                className="w-full py-3 bg-danger text-white font-semibold text-sm rounded-xl hover:bg-danger/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Reversing…" : "Reverse & Delete Commission"}
              </button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
