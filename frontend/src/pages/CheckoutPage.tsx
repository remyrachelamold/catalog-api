import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { createOrder } from "../services/orderApi";
import { processPayment } from "../services/paymentApi";
import { useToast } from "../hooks/useToast";
import { formatPrice } from "../utils/formatPrice";
import type { OrderShipping } from "../types/order";
import "./CheckoutPage.css";

const INITIAL_SHIPPING: OrderShipping = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const [shipping, setShipping] = useState<OrderShipping>(INITIAL_SHIPPING);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking" | "cod">("card");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("demo@upi");
  const [bank, setBank] = useState("State Bank of India");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingCost = 10;
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shippingCost + tax).toFixed(2));

  const cartProducts = useMemo(
    () =>
      items.map((item) => ({
        productId: item.product._id,
        name: item.product.name,
        category: item.product.category,
        imageUrl: item.product.imageUrl,
        price: item.product.price,
        quantity: item.quantity,
      })),
    [items]
  );

  const handleChange = (field: keyof OrderShipping, value: string) => {
    setShipping((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty. Add products before checking out.");
      return;
    }

    const missingField = Object.entries(shipping).find(([, value]) => !value.trim());
    if (missingField) {
      setError(`Please fill in your ${missingField[0]}.`);
      return;
    }

    // Payment handling
    try {
      setProcessingPayment(true);

      // Validate payment inputs per method (basic validation only)
      let simulate: "success" | "failure" | undefined;

      if (paymentMethod === "card") {
        if (!cardName.trim()) {
          setError("Please enter the cardholder name.");
          setProcessingPayment(false);
          return;
        }

        const digits = cardNumber.replace(/\s+/g, "");
        if (!/^\d{13,19}$/.test(digits)) {
          setError("Please enter a valid card number (demo).");
          setProcessingPayment(false);
          return;
        }

        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
          setError("Expiry must be MM/YY (demo).");
          setProcessingPayment(false);
          return;
        }

        if (!/^\d{3,4}$/.test(cardCvv)) {
          setError("Please enter a valid CVV (demo).");
          setProcessingPayment(false);
          return;
        }

        // Demo failure card
        if (digits === "4000000000000002") {
          simulate = "failure";
        }
      }

      if (paymentMethod === "upi") {
        if (!/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(upiId)) {
          setError("Please enter a valid UPI ID (demo). Example: demo@upi");
          setProcessingPayment(false);
          return;
        }
      }

      // Call demo payment endpoint for online methods
      let paymentResult: any = { paymentMethod, paymentStatus: "pending" };
      if (paymentMethod !== "cod") {
        try {
          const cardLast4 = paymentMethod === "card" ? cardNumber.replace(/\s+/g, "").slice(-4) : undefined;
          paymentResult = await processPayment({
            paymentMethod,
            simulate,
            cardLast4,
            upiId: paymentMethod === "upi" ? upiId : undefined,
            bank: paymentMethod === "netbanking" ? bank : undefined,
          });
        } catch (err: any) {
          setError(err?.response?.data?.message ?? "Payment failed. Please try again.");
          setProcessingPayment(false);
          return;
        }
      } else {
        paymentResult = { paymentMethod: "cod", paymentStatus: "pending" };
      }

      // If payment failed, stop
      if (paymentResult.paymentStatus === "failed" || paymentResult.status === 402) {
        setError(paymentResult.message ?? "Payment failed (demo). Please try again.");
        setProcessingPayment(false);
        return;
      }

      // Create order with safe payment info only
      const payload: any = {
        items: cartProducts,
        shipping,
      };

      if (paymentResult.paymentMethod) payload.paymentMethod = paymentResult.paymentMethod;
      if (paymentResult.paymentStatus) payload.paymentStatus = paymentResult.paymentStatus;
      if (paymentResult.transactionId) payload.transactionId = paymentResult.transactionId;
      if (paymentResult.paidAt) payload.paidAt = paymentResult.paidAt;

      setLoading(true);
      const response = await createOrder(payload);

      clearCart();
      showToast(paymentMethod === "cod" ? "Order placed (COD)." : "Payment successful and order placed.", "success");

      // Navigate to a payment result page with state
      navigate("/payment-result", {
        state: {
          success: true,
          orderId: response.order._id,
          transactionId: paymentResult.transactionId,
          paymentMethod: paymentResult.paymentMethod,
          amount: total,
          paidAt: paymentResult.paidAt,
        },
      });
    } catch (err) {
      setError("Unable to place order. Please try again.");
    } finally {
      setProcessingPayment(false);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-page__empty" role="status">
          <div className="checkout-page__empty-icon" aria-hidden="true">🛒</div>
          <h1>Your cart is empty</h1>
          <p>Add items to your cart before completing checkout.</p>
          <button type="button" className="checkout-page__button" onClick={() => navigate("/cart")}>Back to cart</button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-page__heading">
        <p className="checkout-page__eyebrow">Checkout</p>
        <h1>Complete your order</h1>
        <p className="checkout-page__subtitle">Review your order, enter shipping details, and place your order securely.</p>
      </section>

      <form className="checkout-page__content" onSubmit={handleSubmit} noValidate>
        <div className="checkout-page__form">
          <div className="checkout-page__section">
            <h2>Shipping information</h2>
            <div className="checkout-page__field-group">
              <label>
                Full name
                <input
                  type="text"
                  value={shipping.fullName}
                  onChange={(event) => handleChange("fullName", event.target.value)}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={shipping.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  required
                />
              </label>
            </div>

            <div className="checkout-page__field-group">
              <label>
                Phone
                <input
                  type="tel"
                  value={shipping.phone}
                  onChange={(event) => handleChange("phone", event.target.value)}
                  required
                />
              </label>
              <label>
                Address
                <input
                  type="text"
                  value={shipping.address}
                  onChange={(event) => handleChange("address", event.target.value)}
                  required
                />
              </label>
            </div>

            <div className="checkout-page__field-group">
              <label>
                City
                <input
                  type="text"
                  value={shipping.city}
                  onChange={(event) => handleChange("city", event.target.value)}
                  required
                />
              </label>
              <label>
                State
                <input
                  type="text"
                  value={shipping.state}
                  onChange={(event) => handleChange("state", event.target.value)}
                  required
                />
              </label>
            </div>

            <div className="checkout-page__field-group">
              <label>
                ZIP code
                <input
                  type="text"
                  value={shipping.zipCode}
                  onChange={(event) => handleChange("zipCode", event.target.value)}
                  required
                />
              </label>
              <label>
                Country
                <input
                  type="text"
                  value={shipping.country}
                  onChange={(event) => handleChange("country", event.target.value)}
                  required
                />
              </label>
            </div>
          </div>

          <div className="checkout-page__section">
            <h2>Payment</h2>

            <div className="checkout-page__payment-methods">
              <label>
                <input type="radio" name="payment" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} /> Card
              </label>
              <label>
                <input type="radio" name="payment" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} /> UPI
              </label>
              <label>
                <input type="radio" name="payment" checked={paymentMethod === "netbanking"} onChange={() => setPaymentMethod("netbanking")} /> Net Banking
              </label>
              <label>
                <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} /> Cash on Delivery
              </label>
            </div>

            {paymentMethod === "card" && (
              <div style={{ marginTop: "1rem" }}>
                <label>
                  Cardholder name
                  <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Demo: Jane Doe" />
                </label>
                <label>
                  Card number
                  <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242 (demo)" />
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <label style={{ flex: 1 }}>
                    Expiry (MM/YY)
                    <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="12/34" />
                  </label>
                  <label style={{ width: "6rem" }}>
                    CVV
                    <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="123" />
                  </label>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#666" }}>This is a demo payment — do not enter real card details. Test failing card: 4000 0000 0000 0002</p>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div style={{ marginTop: "1rem" }}>
                <label>
                  UPI ID
                  <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="demo@upi" />
                </label>
                <p style={{ fontSize: "0.85rem", color: "#666" }}>This is a demo — no real UPI transaction will occur.</p>
              </div>
            )}

            {paymentMethod === "netbanking" && (
              <div style={{ marginTop: "1rem" }}>
                <label>
                  Select bank
                  <select value={bank} onChange={(e) => setBank(e.target.value)}>
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </label>
                <p style={{ fontSize: "0.85rem", color: "#666" }}>This is a demo — no bank authentication will occur.</p>
              </div>
            )}

            {paymentMethod === "cod" && (
              <p style={{ marginTop: "1rem" }}>You will pay when your order is delivered. No payment details are required.</p>
            )}

            {error && <p className="checkout-page__error" role="alert">{error}</p>}

            <button type="submit" className="checkout-page__submit" disabled={loading || processingPayment}>
              {processingPayment ? "Processing payment…" : paymentMethod === "cod" ? `Place Order (${formatPrice(total)})` : `Pay ${formatPrice(total)}`}
            </button>
          </div>
        </div>

        <aside className="checkout-page__summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <div className="checkout-page__summary-row">
            <span>Items</span>
            <strong>{items.length}</strong>
          </div>
          <div className="checkout-page__summary-row">
            <span>Total quantity</span>
            <strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong>
          </div>
          <div className="checkout-page__summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div className="checkout-page__summary-row">
            <span>Shipping</span>
            <strong>{formatPrice(shippingCost)}</strong>
          </div>
          <div className="checkout-page__summary-row">
            <span>Tax</span>
            <strong>{formatPrice(tax)}</strong>
          </div>
          <div className="checkout-page__summary-row checkout-page__summary-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <div className="checkout-page__line-items">
            {items.map((item) => (
              <div key={item.product._id} className="checkout-page__product-row">
                <span>{item.product.name}</span>
                <strong>{formatPrice(item.product.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
        </aside>
      </form>
    </main>
  );
}
