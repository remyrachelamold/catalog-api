import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminUsers, toggleAdminUserStatus, updateAdminUserRole } from "../services/adminApi";
import type { AuthUser } from "../types/auth";
import "./AdminPages.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadUsers() {
      try {
        setLoading(true);
        const data = await fetchAdminUsers();
        if (isMounted) {
          setUsers(data.users);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load users.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleRoleChange(id: string, role: string) {
    try {
      const response = await updateAdminUserRole(id, role);
      setUsers((current) => current.map((user) => (user.id === id ? response.user : user)));
      setSuccessMessage("User role updated.");
    } catch {
      setError("Unable to update user role.");
    }
  }

  async function handleStatusChange(id: string, isDisabled: boolean) {
    try {
      const response = await toggleAdminUserStatus(id, isDisabled);
      setUsers((current) => current.map((user) => (user.id === id ? response.user : user)));
      setSuccessMessage("User status updated.");
    } catch {
      setError("Unable to update user status.");
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="admin-eyebrow">Admin users</p>
          <h1>User management</h1>
          <p className="admin-subtitle">Review accounts, change roles, and enable or disable access.</p>
        </div>
        <Link to="/admin" className="admin-link">Back to dashboard</Link>
      </section>

      <section className="admin-card admin-card--wide">
        {error && <p className="admin-error">{error}</p>}
        {successMessage && <p className="admin-success">{successMessage}</p>}
        {loading ? <p>Loading users…</p> : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      <select value={user.role ?? "customer"} onChange={(event) => handleRoleChange(user.id, event.target.value)}>
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <label>
                        <input type="checkbox" checked={Boolean(user.isDisabled)} onChange={(event) => handleStatusChange(user.id, event.target.checked)} />
                        Disabled
                      </label>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
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
