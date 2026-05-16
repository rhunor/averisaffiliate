"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  userId: { firstName: string; lastName: string; email: string } | null;
}

type TypeFilter = "" | "subscription" | "commission" | "renewal_commission" | "withdrawal";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [type, setType] = useState<TypeFilter>("");
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (type) params.set("type", type);
    fetch(`/api/admin/transactions?${params}`)
      .then((r) => r.json())
      .then((d) => { setTransactions(d.transactions || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .finally(() => setLoading(false));
  }, [page, type]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  useEffect(() => { setPage(1); }, [type]);

  const typeFilters: { label: string; value: TypeFilter }[] = [
    { label: "All", value: "" },
    { label: "Subscriptions", value: "subscription" },
    { label: "Commissions", value: "commission" },
    { label: "Renewals", value: "renewal_commission" },
    { label: "Withdrawals", value: "withdrawal" },
  ];

  function typeLabel(t: string) {
    return { subscription: "Sub", commission: "Commission", renewal_commission: "Renewal", withdrawal: "Withdrawal" }[t] || t;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{total} total transactions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-2 flex-wrap">
            {typeFilters.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  type === value
                    ? "bg-secondary text-white"
                    : "bg-muted text-muted-foreground hover:bg-border"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-secondary border-t-transparent" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center">
              <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {["User", "Type", "Amount", "Description", "Date", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">
                          {tx.userId ? `${tx.userId.firstName} ${tx.userId.lastName}` : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">{tx.userId?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          tx.type === "commission" || tx.type === "renewal_commission" ? "success" :
                          tx.type === "subscription" ? "info" : "secondary"
                        }>
                          {typeLabel(tx.type)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(tx.amount)}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-48 truncate">{tx.description}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(tx.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={tx.status === "completed" ? "success" : tx.status === "pending" ? "warning" : "secondary"}>
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted disabled:opacity-40">Previous</button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
