const express = require("express");

const app = express();
app.use(express.json());

const KORAPAY_SECRET = process.env.KORAPAY_SECRET_KEY;
const PROXY_SECRET = process.env.PAYOUT_PROXY_SECRET;
const PORT = process.env.PORT || 3001;

if (!KORAPAY_SECRET) {
  console.error("KORAPAY_SECRET_KEY is not set");
  process.exit(1);
}
if (!PROXY_SECRET) {
  console.error("PAYOUT_PROXY_SECRET is not set");
  process.exit(1);
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/disburse", async (req, res) => {
  const incoming = req.headers["x-proxy-secret"];
  if (incoming !== PROXY_SECRET) {
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }

  try {
    const response = await fetch(
      "https://api.korapay.com/merchant/api/v1/transactions/disburse",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KORAPAY_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(25000),
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("[proxy/disburse]", err?.message || err);
    return res.status(502).json({ status: false, message: "Proxy request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Averis payout proxy running on port ${PORT}`);
});
