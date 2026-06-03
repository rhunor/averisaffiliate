"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Copy, ExternalLink, QrCode, CheckCircle, ShoppingBag, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { siteConfig } from "@/config/site";

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

function ShareModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(product.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function shareWhatsApp() {
    const text = `Join Averis Academy — Nigeria's #1 affiliate learning platform!\n\nUse my link to get started:\n${product.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function shareTelegram() {
    const text = `Join Averis Academy with my affiliate link: ${product.referralLink}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(product.referralLink)}&text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-foreground text-lg">{product.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Share your affiliate link and earn commission</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-lg font-bold">✕</button>
        </div>

        {/* Commission badges */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-success/8 border border-success/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Commission per sale</p>
            <p className="font-black text-success text-xl">50%</p>
            <p className="text-xs text-success font-semibold">{formatCurrency(product.commissionAmount)}</p>
          </div>
          <div className="bg-secondary/8 border border-secondary/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Subscription commission</p>
            <p className="font-black text-secondary text-xl">50%</p>
            <p className="text-xs text-secondary font-semibold">{formatCurrency(product.renewalCommissionAmount)}</p>
          </div>
        </div>

        {/* Link */}
        <div className="bg-muted rounded-xl p-3 mb-4">
          <p className="text-[10px] text-muted-foreground mb-1 font-medium">Your affiliate link</p>
          <p className="text-xs font-mono text-foreground break-all leading-relaxed">{product.referralLink}</p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={copy}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-colors"
          >
            {copied ? <CheckCircle className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <a
            href={product.referralLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted hover:bg-border text-muted-foreground text-sm font-semibold transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open Link
          </a>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-sm font-semibold transition-colors"
          >
            <Share2 className="h-4 w-4" />
            WhatsApp
          </button>
          <button
            onClick={shareTelegram}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] text-sm font-semibold transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Telegram
          </button>
        </div>

        {/* QR Code */}
        <div className="mt-4 pt-4 border-t border-border flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">Scan QR code to share offline</p>
          <div className="bg-white p-3 rounded-xl border border-border">
            <QRCodeSVG value={product.referralLink} size={120} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { data: session } = useSession();
  const sessionUser = session?.user as unknown as Record<string, unknown>;
  const referralCode = sessionUser?.referralCode as string | undefined;
  const appUrl = typeof window !== "undefined" ? window.location.origin : siteConfig.url;

  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [shareProduct, setShareProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => setDbProducts(d.products || [])).finally(() => setLoading(false));
  }, []);

  // Averis Academy is always the first product — uses the user's own referral link
  const averisAcademyProduct = useMemo<Product>(() => ({
    _id: "__averis_academy__",
    name: "Averis Academy",
    description: "Africa's premier wealth creation platform. Make money, invest it, and build generational wealth.",
    imageUrl: null,
    price: siteConfig.signupFee,
    commissionAmount: siteConfig.commission.newSubscription,
    renewalCommissionAmount: siteConfig.commission.renewal,
    slug: "averis-academy",
    referralLink: referralCode ? `${appUrl}/register?aff=${referralCode}` : "",
  }), [referralCode, appUrl]);

  const products = useMemo(() => [averisAcademyProduct, ...dbProducts], [averisAcademyProduct, dbProducts]);

  function copyLink(id: string, link: string) {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {shareProduct && <ShareModal product={shareProduct} onClose={() => setShareProduct(null)} />}

      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary to-primary-light px-6 py-5">
        <img src="/Iconography/Badge.svg" alt="" aria-hidden className="absolute -right-2 -top-3 h-24 opacity-10 pointer-events-none select-none" />
        <img src="/Iconography/Naira Sign.svg" alt="" aria-hidden className="absolute right-20 bottom-1 h-12 opacity-8 pointer-events-none select-none" />
        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Affiliate Products</p>
        <h1 className="text-xl font-bold text-white">Averis Academy Products</h1>
        <p className="text-white/60 text-sm mt-0.5">Promote and earn 50% commission on every sale you close</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => {
            const isAverisAcademy = product._id === "__averis_academy__";
            const linkReady = !!product.referralLink;
            return (
            <Card key={product._id} className={`overflow-hidden${isAverisAcademy ? " ring-2 ring-secondary/40" : ""}`}>
              <CardHeader className="bg-linear-to-br from-primary to-primary-light pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <CardTitle className="text-white">{product.name}</CardTitle>
                    </div>
                    <p className="text-white/70 text-sm mt-0.5 leading-relaxed">{product.description}</p>
                  </div>
                  {/* Commission % badges */}
                  <div className="shrink-0 ml-3 flex flex-col gap-1.5 items-end">
                    <Badge variant="info" className="bg-white/20 text-white border-white/30 text-[10px] font-bold">
                      Sale 50%
                    </Badge>
                    <Badge variant="info" className="bg-white/20 text-white border-white/30 text-[10px] font-bold">
                      Sub 50%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                {/* Commission info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Commission per sale</p>
                    <p className="font-black text-success text-base">50%</p>
                    <p className="text-xs font-bold text-success">{formatCurrency(product.commissionAmount)}</p>
                  </div>
                  <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-muted-foreground">Subscription commission</p>
                    <p className="font-black text-secondary text-base">50%</p>
                    <p className="text-xs font-bold text-secondary">{formatCurrency(product.renewalCommissionAmount)}</p>
                  </div>
                </div>

                {/* Referral link */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">Your affiliate link</p>
                  {!linkReady ? (
                    <div className="bg-muted rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-secondary border-t-transparent animate-spin shrink-0" />
                      <p className="text-xs text-muted-foreground">Loading your link…</p>
                    </div>
                  ) : (
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
                  )}
                </div>

                {/* Share button */}
                <button
                  onClick={() => linkReady && setShareProduct(product)}
                  disabled={!linkReady}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-primary font-bold text-sm hover:bg-secondary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Share2 className="h-4 w-4" />
                  Share &amp; Earn
                </button>

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
            );
          })}
        </div>
    </div>
  );
}
