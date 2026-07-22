import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../services/orderApi";
import type { Order } from "../types/order";
import { formatPrice } from "../utils/formatPrice";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchOrders();
        if (isMounted) {
          setOrders(response.orders);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load your orders. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-card__eyebrow">Order history</p>
        <h1>Your orders</h1>
        <p className="auth-card__subtitle">
          Review the orders you've placed and view details for each purchase.
        </p>

        {loading ? (
          <p>Loading orders…</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : orders.length === 0 ? (
          <div>
            <p>You haven't placed any orders yet.</p>
            <Link to="/" className="auth-form__submit">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="auth-form auth-form--stacked">
            {orders.map((order) => (
              <article key={order._id} className="auth-form__field auth-form__field--card">
                <div>
                  <p className="auth-form__field-label">Order</p>
                  <strong>{order._id}</strong>
                </div>
                <div>
                  <p className="auth-form__field-label">Placed</p>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="auth-form__field-label">Total</p>
                  <strong>{formatPrice(order.total)}</strong>
                </div>
                <div>
                  <p className="auth-form__field-label">Status</p>
                  <p>{order.status}</p>
                </div>
                <Link to={`/orders/${order._id}`} className="auth-form__submit">
                  View details
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
