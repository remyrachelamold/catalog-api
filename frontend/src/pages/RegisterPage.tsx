import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { registerUser } from "../services/authApi";
import type { RegisterFormValues } from "../types/auth";
import "./AuthPage.css";

const initialValues: RegisterFormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login } = useAuthContext();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function validate(valuesToCheck: RegisterFormValues) {
    if (!valuesToCheck.fullName.trim()) {
      return "Please enter your full name.";
    }

    if (!valuesToCheck.email.trim()) {
      return "Please enter your email address.";
    }

    if (valuesToCheck.password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    if (valuesToCheck.password !== valuesToCheck.confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = await registerUser(values);
      login(payload);
      showToast("Account created successfully.", "success");
      navigate("/");
    } catch (authError) {
      const fallback = "Unable to create your account right now.";
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
        <p className="auth-card__eyebrow">Create account</p>
        <h1>Register today</h1>
        <p className="auth-card__subtitle">Join the catalog store and keep your cart saved.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-form__error">{error}</div>}

          <label className="auth-form__field">
            <span>Full Name</span>
            <input
              type="text"
              value={values.fullName}
              onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
            />
          </label>

          <label className="auth-form__field">
            <span>Email</span>
            <input
              type="email"
              value={values.email}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            />
          </label>

          <label className="auth-form__field">
            <span>Password</span>
            <input
              type="password"
              value={values.password}
              onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            />
          </label>

          <label className="auth-form__field">
            <span>Confirm Password</span>
            <input
              type="password"
              value={values.confirmPassword}
              onChange={(event) => setValues((current) => ({ ...current, confirmPassword: event.target.value }))}
            />
          </label>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
