import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchOrderById } from "../services/orderApi";
import type { Order } from "../types/order";
import { formatPrice } from "../utils/formatPrice";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!id) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchOrderById(id);
        if (isMounted) {
          setOrder(response.order);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load order details. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p>Loading order details…</p>
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p role="alert">{error ?? "Order not found."}</p>
          <Link to="/orders" className="auth-form__submit">
            Back to orders
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-card__eyebrow">Order details</p>
        <h1>Order #{order._id}</h1>
        <p className="auth-card__subtitle">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>

        <div className="auth-form auth-form--stacked">
          <div className="auth-form__field auth-form__field--card">
            <p className="auth-form__field-label">Status</p>
            <strong>{order.status}</strong>
          </div>

          <div className="auth-form__field auth-form__field--card">
            <p className="auth-form__field-label">Shipping address</p>
            <address>
              <p>{order.shipping.fullName}</p>
              <p>{order.shipping.address}</p>
              <p>
                {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}
              </p>
              <p>{order.shipping.country}</p>
              <p>{order.shipping.phone}</p>
            </address>
          </div>

          <div className="auth-form__field auth-form__field--card">
            <p className="auth-form__field-label">Products</p>
            <ul>
              {order.products.map((item) => (
                <li key={item.productId} style={{ marginBottom: "0.75rem" }}>
                  <strong>{item.name}</strong> × {item.quantity} — {formatPrice(item.price * item.quantity)}
                </li>
              ))}
            </ul>
          </div>

          <div className="auth-form__field auth-form__field--card">
            <p className="auth-form__field-label">Order summary</p>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <div>
                <span>Subtotal:</span> <strong>{formatPrice(order.subtotal)}</strong>
              </div>
              <div>
                <span>Shipping:</span> <strong>{formatPrice(order.shippingCost)}</strong>
              </div>
              <div>
                <span>Tax:</span> <strong>{formatPrice(order.tax)}</strong>
              </div>
              <div>
                <span>Total:</span> <strong>{formatPrice(order.total)}</strong>
              </div>
            </div>
          </div>

          <Link to="/orders" className="auth-form__submit">
            Back to orders
          </Link>
        </div>
      </section>
    </main>
  );
}
