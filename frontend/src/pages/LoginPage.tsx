import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { loginUser } from "../services/authApi";
import type { LoginFormValues } from "../types/auth";
import "./AuthPage.css";

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login } = useAuthContext();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = await loginUser(values);
      login(payload);
      showToast("Welcome back!", "success");
      navigate("/");
    } catch (authError) {
      const fallback = "Unable to log in. Please check your credentials.";
      if (authError && typeof authError === "object" && "response" in authError) {
        const errorResponse = authError as { response?: { data?: { message?: string } } };
        setError(errorResponse.response?.data?.message ?? fallback);
      } else {
        setError(fallback);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="auth-card__eyebrow">Welcome back</p>
        <h1>Log in to your account</h1>
        <p className="auth-card__subtitle">Access your saved cart and account details.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-form__error">{error}</div>}

          <label className="auth-form__field">
            <span>Email</span>
            <input
              type="email"
              value={values.email}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>

          <label className="auth-form__field">
            <span>Password</span>
            <input
              type="password"
              value={values.password}
              onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="auth-card__footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}
