"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, QrCode, CheckCircle, ShoppingBag } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  commissionAmount: number;
  renewalCommissionAmount: number;
  slug: string;
  referralLink: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(d.products || [])).finally(() => setLoading(false));
  }, []);

  function copyLink(id: string, link: string) {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary to-primary-light px-6 py-5">
        <img src="/Iconography/Badge.svg" alt="" aria-hidden className="absolute -right-2 -top-3 h-24 opacity-10 pointer-events-none select-none" />
        <img src="/Iconography/Naira Sign.svg" alt="" aria-hidden className="absolute right-20 bottom-1 h-12 opacity-8 pointer-events-none select-none" />
        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Affiliate Products</p>
        <h1 className="text-xl font-bold text-white">Averis Academy Products</h1>
        <p className="text-white/60 text-sm mt-0.5">Promote and earn 50% commission on every sale you close</p>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No products available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <CardHeader className="bg-linear-to-br from-primary to-primary-light pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white">{product.name}</CardTitle>
                    <p className="text-white/70 text-sm mt-1 leading-relaxed">{product.description}</p>
                  </div>
                  <Badge variant="info" className="shrink-0 ml-3 bg-white/20 text-white border-white/30">
                    50%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                {/* Commission info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">New sub</p>
                    <p className="font-bold text-success text-lg">{formatCurrency(product.commissionAmount)}</p>
                  </div>
                  <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Renewal</p>
                    <p className="font-bold text-secondary text-lg">{formatCurrency(product.renewalCommissionAmount)}</p>
                  </div>
                </div>

                {/* Referral link */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">Your referral link</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-muted rounded-xl px-3 py-2 overflow-hidden">
                      <p className="text-xs font-mono text-foreground truncate">{product.referralLink}</p>
                    </div>
                    <button
                      onClick={() => copyLink(product._id, product.referralLink)}
                      className="shrink-0 w-9 h-9 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-secondary flex items-center justify-center transition-colors"
                      title="Copy link"
                    >
                      {copiedId === product._id ? <CheckCircle className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <a
                      href={product.referralLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                      title="Open link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => setQrId(qrId === product._id ? null : product._id)}
                      className="shrink-0 w-9 h-9 rounded-xl bg-muted hover:bg-border text-muted-foreground flex items-center justify-center transition-colors"
                      title="Show QR code"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* QR Code */}
                {qrId === product._id && (
                  <div className="flex flex-col items-center gap-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">Scan to share</p>
                    <div className="bg-white p-3 rounded-xl border border-border">
                      <QRCodeSVG value={product.referralLink} size={140} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
