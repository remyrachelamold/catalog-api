import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminOrders, updateAdminOrderStatus } from "../services/adminApi";
import type { Order } from "../types/order";
import { formatPrice } from "../utils/formatPrice";
import "./AdminPages.css";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await fetchAdminOrders();
        if (isMounted) {
          setOrders(data.orders);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load orders.");
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

  async function handleStatusChange(id: string, status: string) {
    try {
      const response = await updateAdminOrderStatus(id, status);
      setOrders((current) => current.map((order) => (order._id === id ? response.order : order)));
      setSuccessMessage("Order status updated.");
    } catch {
      setError("Unable to update order status.");
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="admin-eyebrow">Admin orders</p>
          <h1>Order management</h1>
          <p className="admin-subtitle">Track every order and update status as fulfillment progresses.</p>
        </div>
        <Link to="/admin" className="admin-link">Back to dashboard</Link>
      </section>

      <section className="admin-card admin-card--wide">
        {error && <p className="admin-error">{error}</p>}
        {successMessage && <p className="admin-success">{successMessage}</p>}
        {loading ? <p>Loading orders…</p> : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.shipping.fullName}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{formatPrice(order.total)}</td>
                    <td>
                      <select value={order.status} onChange={(event) => handleStatusChange(order._id, event.target.value)}>
                        {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
