import { useLocation, useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice";

export default function PaymentResultPage() {
  const { state } = useLocation() as any;
  const navigate = useNavigate();

  if (!state || typeof state !== "object") {
    navigate("/orders");
    return null;
  }

  const { success, orderId, transactionId, paymentMethod, amount, paidAt } = state;

  return (
    <main className="auth-page">
      <section className="auth-card">
        {success ? (
          <div>
            <p className="auth-card__eyebrow">Payment successful</p>
            <h1>Thank you — your payment was processed</h1>
            <p>Order ID: <strong>{orderId}</strong></p>
            {transactionId && <p>Transaction ID: <strong>{transactionId}</strong></p>}
            <p>Payment method: <strong>{paymentMethod}</strong></p>
            <p>Amount paid: <strong>{formatPrice(amount)}</strong></p>
            {paidAt && <p>Paid at: <strong>{new Date(paidAt).toLocaleString()}</strong></p>}

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button onClick={() => navigate(`/orders/${orderId}`)} className="auth-form__submit">View Order</button>
              <button onClick={() => navigate("/")}>Continue Shopping</button>
            </div>
          </div>
        ) : (
          <div>
            <p className="auth-card__eyebrow">Payment failed</p>
            <h1>Payment could not be processed</h1>
            <p>Please try again or choose a different payment method.</p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button onClick={() => navigate(-1)} className="auth-form__submit">Try again</button>
              <button onClick={() => navigate("/")}>Continue Shopping</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
