"use client";

import { useEffect, useState } from "react";
import { Plus, Package, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  renewalPrice: number;
  commissionAmount: number;
  renewalCommissionAmount: number;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

const defaultForm = {
  name: "", description: "", price: "", renewalPrice: "", slug: "", sortOrder: "0",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function fetchProducts() {
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchProducts(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const price = parseFloat(form.price);
      const renewalPrice = parseFloat(form.renewalPrice) || price;
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price,
          renewalPrice,
          slug: form.slug,
          sortOrder: parseInt(form.sortOrder) || 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed to create product."); return; }
      setShowForm(false);
      setForm(defaultForm);
      fetchProducts();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage affiliate products</p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); setError(""); }}
          className="flex items-center gap-2 bg-secondary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-secondary-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add product
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Product</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Product name</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Slug (URL-safe)</label>
                  <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} required
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required rows={3}
                  className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Price (₦)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required min={0}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Renewal Price (₦)</label>
                  <input type="number" value={form.renewalPrice} onChange={(e) => setForm((f) => ({ ...f, renewalPrice: e.target.value }))} min={0}
                    placeholder="Same as price"
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Sort order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} min={0}
                    className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Commission (50%) will be calculated automatically.</p>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="bg-secondary text-white font-semibold px-5 py-2 rounded-xl hover:bg-secondary-dark transition-colors disabled:opacity-60 text-sm">
                  {submitting ? "Creating…" : "Create product"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-muted text-muted-foreground font-semibold px-5 py-2 rounded-xl hover:bg-border transition-colors text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products list */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products yet. Add your first product above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <Card key={product._id}>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{product.slug}</p>
                  </div>
                  <Badge variant={product.isActive ? "success" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">New sub</p>
                    <p className="font-bold text-foreground">{formatCurrency(product.price)}</p>
                    <p className="text-xs text-success">{formatCurrency(product.commissionAmount)} commission</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">Renewal</p>
                    <p className="font-bold text-foreground">{formatCurrency(product.renewalPrice)}</p>
                    <p className="text-xs text-success">{formatCurrency(product.renewalCommissionAmount)} commission</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
