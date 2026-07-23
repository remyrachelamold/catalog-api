import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchAdminDashboard } from "../services/adminApi";
import { formatPrice } from "../utils/formatPrice";
import "./AdminDashboardPage.css";

interface DashboardSummary {
  productsCount: number;
  categoriesCount: number;
  usersCount: number;
  ordersCount: number;
  revenue: number;
  pendingOrders: number;
  deliveredOrders: number;
}

interface InventorySummary {
  inventoryValue: number;
  totalProducts: number;
  productsByCategory: Array<{ category: string; count: number }>;
  lowStockProducts: Array<{ name: string; stock?: number }>;
  recentProducts: Array<{ name: string; category: string; createdAt?: string }>;
}

interface ChartPayload {
  productsByCategory: Array<{ category: string; count: number }>;
  monthlyOrders: Array<{ month: string; orders: number; revenue: number }>;
  revenueOverview: Array<{ month: string; revenue: number }>;
  orderStatusDistribution: Array<{ status: string; count: number }>;
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [inventory, setInventory] = useState<InventorySummary | null>(null);
  const [charts, setCharts] = useState<ChartPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const data = await fetchAdminDashboard();
        if (isMounted) {
          setSummary(data.summary);
          setInventory(data.inventory);
          setCharts(data.charts);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load the dashboard. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => [
    { label: "Total Products", value: summary?.productsCount ?? 0 },
    { label: "Total Categories", value: summary?.categoriesCount ?? 0 },
    { label: "Total Users", value: summary?.usersCount ?? 0 },
    { label: "Total Orders", value: summary?.ordersCount ?? 0 },
    { label: "Total Revenue", value: summary ? formatPrice(summary.revenue) : formatPrice(0) },
    { label: "Pending Orders", value: summary?.pendingOrders ?? 0 },
    { label: "Delivered Orders", value: summary?.deliveredOrders ?? 0 },
  ], [summary]);

  if (loading) {
    return <main className="admin-page"><section className="admin-card">Loading dashboard…</section></main>;
  }

  if (error) {
    return <main className="admin-page"><section className="admin-card">{error}</section></main>;
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="admin-eyebrow">Admin dashboard</p>
          <h1>Operations overview</h1>
          <p className="admin-subtitle">Monitor store health, orders, users, and inventory from one place.</p>
        </div>
        <div className="admin-actions">
          <Link to="/admin/products" className="admin-link">Manage products</Link>
          <Link to="/admin/orders" className="admin-link">Manage orders</Link>
          <Link to="/admin/users" className="admin-link">Manage users</Link>
        </div>
      </section>

      <section className="admin-stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="admin-stat-card">
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      {inventory && charts && (
        <>
          <section className="admin-grid">
            <article className="admin-card">
              <h2>Inventory overview</h2>
              <p><strong>Inventory Value:</strong> {formatPrice(inventory.inventoryValue)}</p>
              <p><strong>Total Products:</strong> {inventory.totalProducts}</p>
              <p><strong>Low stock products:</strong> {inventory.lowStockProducts.length}</p>
            </article>

            <article className="admin-card">
              <h2>Products by category</h2>
              <ul>
                {inventory.productsByCategory.map((item) => (
                  <li key={item.category}>{item.category}: {item.count}</li>
                ))}
              </ul>
            </article>

            <article className="admin-card">
              <h2>Low stock items</h2>
              <ul>
                {inventory.lowStockProducts.map((item) => (
                  <li key={item.name}>{item.name} (stock {item.stock ?? 0})</li>
                ))}
              </ul>
            </article>

            <article className="admin-card">
              <h2>Recently added</h2>
              <ul>
                {inventory.recentProducts.map((item) => (
                  <li key={`${item.name}-${item.category}`}>{item.name} · {item.category}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="admin-chart-grid">
            <article className="admin-card">
              <h2>Products by category</h2>
              <div className="admin-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={charts.productsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#1d4ed8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="admin-card">
              <h2>Monthly orders</h2>
              <div className="admin-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={charts.monthlyOrders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="orders" stroke="#0f766e" fill="#99f6e4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="admin-card">
              <h2>Revenue overview</h2>
              <div className="admin-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={charts.revenueOverview}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="admin-card">
              <h2>Order status distribution</h2>
              <div className="admin-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={charts.orderStatusDistribution} dataKey="count" nameKey="status" outerRadius={90}>
                      {charts.orderStatusDistribution.map((entry, index) => (
                        <Cell key={`${entry.status}-${index}`} fill={index % 2 === 0 ? "#1d4ed8" : "#f59e0b"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}
