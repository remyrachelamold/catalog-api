import { Link } from "react-router-dom";
import "./CartPage.css";

export default function CheckoutPlaceholder() {
  return (
    <main className="cart-page">
      <section className="cart-page__empty" role="status">
        <div className="cart-page__empty-icon" aria-hidden="true">
          ✅
        </div>
        <h1>Checkout coming soon</h1>
        <p>Your cart is ready. This placeholder will be replaced with a full checkout experience in a later phase.</p>
        <Link to="/cart" className="cart-page__primary-action">
          Back to Cart
        </Link>
      </section>
    </main>
  );
}
