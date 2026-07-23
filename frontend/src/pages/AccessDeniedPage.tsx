import { Link } from "react-router-dom";
import "./AdminPages.css";

export default function AccessDeniedPage() {
  return (
    <main className="admin-page">
      <section className="admin-card" style={{ maxWidth: 560, margin: "3rem auto" }}>
        <p className="admin-eyebrow">Access denied</p>
        <h1>You do not have permission to view this page.</h1>
        <p className="admin-subtitle">Only administrators can access the admin area.</p>
        <Link to="/" className="admin-link">Return home</Link>
      </section>
    </main>
  );
}
