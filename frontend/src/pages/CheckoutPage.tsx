import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { createOrder } from "../services/orderApi";
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

    setLoading(true);

    try {
      const payload = {
        items: cartProducts,
        shipping,
      };

      const response = await createOrder(payload);
      clearCart();
      showToast("Order placed successfully.", "success");
      navigate(`/orders/${response.order._id}`);
    } catch (err) {
      setError("Unable to place order. Please try again.");
    } finally {
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

          {error && <p className="checkout-page__error" role="alert">{error}</p>}

          <button type="submit" className="checkout-page__submit" disabled={loading}>
            {loading ? "Placing order…" : `Place order (${formatPrice(total)})`}
          </button>
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
