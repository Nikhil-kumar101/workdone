import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          "/auth/login",
          {
            email: cleanEmail,
            password,
          }
        );

      const {
        token,
        user,
      } = response.data;

      if (!token) {
        throw new Error(
          "Login token was not returned."
        );
      }

      sessionStorage.setItem(
        "token",
        token
      );

      sessionStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      if (typeof login === "function") {
        login(token, user);
      }

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Could not login."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <section className="login-brand">

        <div className="login-brand-content">

          <div className="login-brand-logo">
            🎥
          </div>

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to continue to your
            video meetings and collaboration
            workspace.
          </p>

          <div className="login-features">

            <div>
              <span>✓</span>
              HD video meetings
            </div>

            <div>
              <span>✓</span>
              Real-time collaboration
            </div>

            <div>
              <span>✓</span>
              Secure meeting controls
            </div>

          </div>

        </div>

      </section>

      <section className="login-panel">

        <div className="login-card">

          <div className="login-header">

            <div className="login-mobile-logo">
              🎥
            </div>

            <h2>
              Sign in
            </h2>

            <p>
              Enter your account details below.
            </p>

          </div>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            <div className="login-field">

              <label htmlFor="login-email">
                Email address
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />

            </div>

            <div className="login-field">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="login-password-wrapper">

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

            </div>

            {error && (
              <div className="login-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

          </form>

          <div className="login-footer">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create an account
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;