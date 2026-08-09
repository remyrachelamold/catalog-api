import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { fetchProfile, updateProfile, changePassword, updatePreferences, logoutAll, deleteAccount } from "../services/authApi";
import { useToast } from "../hooks/useToast";
import type { AuthProfileResponse } from "../types/auth";
import "./SettingsPage.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout, restoreSession } = useAuthContext();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Appearance
  const [appearance, setAppearance] = useState<"system" | "light" | "dark">("system");

  // Notifications
  const [notifications, setNotifications] = useState<any>({});

  // Shopping prefs
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data: AuthProfileResponse = await fetchProfile();
        if (!mounted) return;
        setProfile(data.user);
        setFullName(data.user.fullName ?? "");
        setEmail(data.user.email ?? "");
        const ap = data.user.appearance ?? "system" as "system" | "light" | "dark";
        setAppearance(ap);
        // apply theme immediately
        try {
          if (ap === "system") {
            document.documentElement.removeAttribute("data-theme");
            window.localStorage.removeItem("catalog-appearance");
          } else {
            document.documentElement.setAttribute("data-theme", ap);
            window.localStorage.setItem("catalog-appearance", ap);
          }
        } catch (e) {
          // ignore
        }
        setNotifications(data.user.notifications ?? {});
        setCurrency(data.user.shoppingPreferences?.currency ?? "INR");
        setLanguage(data.user.shoppingPreferences?.language ?? "en");
      } catch (err) {
        // ignored
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSaveAccount() {
    try {
      await updateProfile({ fullName, email });
      showToast("Profile updated.", "success");
      await restoreSession();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Unable to update profile.", "error");
    }
  }

  async function handleChangePassword() {
    try {
      if (newPassword.length < 6) {
        showToast("New password must be at least 6 characters.", "error");
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
      }

      await changePassword({ currentPassword, newPassword, confirmPassword });
      showToast("Password changed.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Unable to change password.", "error");
    }
  }

  async function handleSavePreferences() {
    try {
      await updatePreferences({
        appearance,
        notifications,
        shoppingPreferences: { currency, language },
      });
      // apply appearance immediately
      if (appearance === "system") {
        document.documentElement.removeAttribute("data-theme");
        window.localStorage.removeItem("catalog-appearance");
      } else {
        document.documentElement.setAttribute("data-theme", appearance);
        window.localStorage.setItem("catalog-appearance", appearance);
      }
      showToast("Preferences saved.", "success");
      await restoreSession();
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Unable to save preferences.", "error");
    }
  }

  async function handleLogoutAll() {
    try {
      await logoutAll();
      logout();
      showToast("Logged out of all devices.", "info");
      navigate("/login");
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Unable to logout from all devices.", "error");
    }
  }

  async function handleDeleteAccount() {
    const ok = window.confirm("Delete your account? This action is permanent and cannot be undone.\nType DELETE to confirm.");
    if (!ok) return;
    const confirmation = window.prompt("Type DELETE to permanently delete your account.");
    if (confirmation !== "DELETE") return;

    try {
      await deleteAccount();
      logout();
      showToast("Account deleted.", "info");
      navigate("/");
    } catch (err: any) {
      showToast(err?.response?.data?.message ?? "Unable to delete account.", "error");
    }
  }

  if (loading) return <main className="settings-page">Loading…</main>;

  return (
    <main className="settings-page">
      <aside className="settings-page__sidebar">
        <h2>Settings</h2>
        <nav>
          <a href="#account">Account</a>
          <a href="#appearance">Appearance</a>
          <a href="#notifications">Notifications</a>
          <a href="#security">Privacy & Security</a>
          <a href="#shopping">Shopping Preferences</a>
          <a href="#danger" className="danger">Delete Account</a>
        </nav>
      </aside>

      <section className="settings-page__content">
        <section id="account" className="settings-card">
          <h3>Account</h3>
          <label>
            Full name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={handleSaveAccount} className="button">Save Changes</button>
          </div>
        </section>

        <section id="appearance" className="settings-card">
          <h3>Appearance</h3>
          <label>
            <input type="radio" name="appearance" checked={appearance === "system"} onChange={() => setAppearance("system")} /> System Default
          </label>
          <label>
            <input type="radio" name="appearance" checked={appearance === "light"} onChange={() => setAppearance("light")} /> Light
          </label>
          <label>
            <input type="radio" name="appearance" checked={appearance === "dark"} onChange={() => setAppearance("dark")} /> Dark
          </label>
          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={handleSavePreferences} className="button">Save Appearance</button>
          </div>
        </section>

        <section id="notifications" className="settings-card">
          <h3>Notifications</h3>
          <label>
            <input type="checkbox" checked={!!notifications.orders} onChange={(e) => setNotifications({ ...notifications, orders: e.target.checked })} /> Order updates
          </label>
          <label>
            <input type="checkbox" checked={!!notifications.shipping} onChange={(e) => setNotifications({ ...notifications, shipping: e.target.checked })} /> Shipping updates
          </label>
          <label>
            <input type="checkbox" checked={!!notifications.delivery} onChange={(e) => setNotifications({ ...notifications, delivery: e.target.checked })} /> Delivery updates
          </label>
          <label>
            <input type="checkbox" checked={!!notifications.promotional} onChange={(e) => setNotifications({ ...notifications, promotional: e.target.checked })} /> Promotional notifications
          </label>
          <label>
            <input type="checkbox" checked={!!notifications.wishlist} onChange={(e) => setNotifications({ ...notifications, wishlist: e.target.checked })} /> Wishlist notifications
          </label>
          <label>
            <input type="checkbox" checked={!!notifications.email} onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })} /> Email notifications
          </label>
          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={handleSavePreferences} className="button">Save Notifications</button>
          </div>
        </section>

        <section id="security" className="settings-card">
          <h3>Privacy & Security</h3>
          <p><strong>Account email:</strong> {profile?.email}</p>
          <div style={{ marginTop: "1rem" }}>
            <h4>Change password</h4>
            <label>
              Current password
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </label>
            <label>
              New password
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </label>
            <label>
              Confirm new password
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </label>
            <div style={{ marginTop: "0.5rem" }}>
              <button onClick={handleChangePassword} className="button">Change Password</button>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <button onClick={() => { logout(); navigate('/login'); }} className="button">Log out</button>
            <button onClick={handleLogoutAll} className="button">Log out of all devices</button>
          </div>
        </section>

        <section id="shopping" className="settings-card">
          <h3>Shopping Preferences</h3>
          <label>
            Preferred currency
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="INR">INR (₹)</option>
            </select>
          </label>
          <label>
            Preferred language
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
            </select>
          </label>
          <div style={{ marginTop: "0.5rem" }}>
            <button onClick={handleSavePreferences} className="button">Save Shopping Preferences</button>
          </div>
        </section>

        <section id="danger" className="settings-card settings-card--danger">
          <h3>Delete Account</h3>
          <p>This action is permanent and will remove your account and related data.</p>
          <div>
            <button onClick={handleDeleteAccount} className="button button--danger">Delete Account</button>
          </div>
        </section>
      </section>
    </main>
  );
}
