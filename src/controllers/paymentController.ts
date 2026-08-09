import type { Request, Response } from "express";

function generateTxnId() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `TXN-${y}${m}${d}-${rand}`;
}

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { paymentMethod, simulate } = req.body ?? {};

    const allowed = ["card", "upi", "netbanking", "cod"];
    if (!paymentMethod || !allowed.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid or missing payment method." });
    }

    // Simulate processing delay (demo only)
    await new Promise((r) => setTimeout(r, 2000));

    // Allow explicit simulation of failure in demo mode
    if (simulate === "failure") {
      return res.status(402).json({ message: "Simulated payment failure (demo)." });
    }

    // For COD we return pending without txn
    if (paymentMethod === "cod") {
      return res.status(200).json({
        paymentMethod,
        paymentStatus: "pending",
      });
    }

    const transactionId = generateTxnId();
    const paidAt = new Date().toISOString();

    return res.status(200).json({
      paymentMethod,
      paymentStatus: "paid",
      transactionId,
      paidAt,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to process payment (demo)." });
  }
};
