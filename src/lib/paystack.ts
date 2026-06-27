import crypto from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

function paystackHeaders(): Record<string, string> {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY env var is not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function listPaystackBanks(): Promise<{ name: string; code: string }[]> {
  const res = await fetch(`${PAYSTACK_BASE}/bank?currency=NGN&perPage=200`, {
    headers: paystackHeaders(),
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message || "Failed to fetch bank list from Paystack");
  return (json.data as Array<{ name: string; code: string }>).map((b) => ({
    name: b.name,
    code: b.code,
  }));
}

export async function resolvePaystackAccount(
  accountNumber: string,
  bankCode: string
): Promise<{ accountName: string }> {
  const res = await fetch(
    `${PAYSTACK_BASE}/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
    { headers: paystackHeaders() }
  );
  const json = await res.json();
  if (!json.status) throw new Error(json.message || "Account resolution failed");
  return { accountName: json.data.account_name as string };
}

export async function createTransferRecipient(params: {
  name: string;
  accountNumber: string;
  bankCode: string;
}): Promise<string> {
  const res = await fetch(`${PAYSTACK_BASE}/transferrecipient`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify({
      type: "nuban",
      name: params.name,
      account_number: params.accountNumber,
      bank_code: params.bankCode,
      currency: "NGN",
    }),
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message || "Failed to create transfer recipient");
  return json.data.recipient_code as string;
}

export interface PaystackTransferResult {
  transferCode: string;
  status: string;
}

export async function initiateTransfer(params: {
  amountNaira: number;
  recipientCode: string;
  reference: string;
  reason: string;
}): Promise<PaystackTransferResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transfer`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify({
      source: "balance",
      amount: Math.round(params.amountNaira * 100), // naira → kobo
      recipient: params.recipientCode,
      reference: params.reference,
      reason: params.reason,
      currency: "NGN",
    }),
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message || "Transfer initiation failed");
  return {
    transferCode: json.data.transfer_code as string,
    status: json.data.status as string,
  };
}

export function verifyPaystackSignature(rawBody: string, signature: string): boolean {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return false;
  const expected = crypto
    .createHmac("sha512", key)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
