import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { fetchProfile } from "../services/authApi";
import type { AuthUser } from "../types/auth";
import "./AuthPage.css";

export default function ProfilePage() {
  const { isAuthenticated, logout, user: authUser } = useAuthContext();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<AuthUser | null>(authUser);
  const [loading, setLoading] = useState(!authUser);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function loadProfile() {
      try {
        const data = await fetchProfile();
        setProfile(data.user);
      } catch {
        setProfile(authUser);
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [authUser, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-card__eyebrow">Your account</p>
        <h1>Profile</h1>
        <p className="auth-card__subtitle">Review your account information and sign out when you are done.</p>

        {loading ? (
          <p>Loading profile...</p>
        ) : profile ? (
          <div className="auth-form">
            <div className="auth-form__field">
              <span>Name</span>
              <p>{profile.fullName}</p>
            </div>
            <div className="auth-form__field">
              <span>Email</span>
              <p>{profile.email}</p>
            </div>
            <div className="auth-form__field">
              <span>Member since</span>
              <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
            <Link to="/orders" className="auth-form__submit">
              View orders
            </Link>
            <button
              type="button"
              className="auth-form__submit"
              onClick={() => {
                logout();
                showToast("You have been logged out.", "info");
              }}
            >
              Log out
            </button>
          </div>
        ) : (
          <p>Unable to load your profile right now.</p>
        )}

        <p className="auth-card__footer">
          <Link to="/">Back to home</Link>
        </p>
      </section>
    </main>
  );
}
