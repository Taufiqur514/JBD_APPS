import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";

export type PaymentMethod = "QRIS" | "VA BCA" | "E-Wallet" | "Kartu Kredit" | "COD";

export type PaymentIntent = {
  provider: "manual-demo" | "midtrans" | "xendit";
  reference: string;
  status: "pending" | "paid" | "expired" | "failed";
  amount: number;
  paymentUrl?: string;
  qrString?: string;
};

export function createPaymentIntent({
  orderId,
  amount,
  method,
}: {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}): PaymentIntent {
  const provider = (process.env.PAYMENT_PROVIDER as PaymentIntent["provider"]) || "manual-demo";
  const reference = `${provider.toUpperCase()}-${orderId}-${randomUUID().slice(0, 8)}`;
  if (provider === "manual-demo") {
    return {
      provider,
      reference,
      status: "pending",
      amount,
      qrString: method === "QRIS" ? `JBD|${orderId}|${amount}|${reference}` : undefined,
    };
  }
  return {
    provider,
    reference,
    status: "pending",
    amount,
    paymentUrl: `/storefront/payment?order=${encodeURIComponent(orderId)}`,
  };
}

export function verifyWebhookSignature(payload: string, signature: string | null) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const received = signature.trim();
  if (expected.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

