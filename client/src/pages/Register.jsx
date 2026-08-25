import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================
  // REGISTER
  // ==========================================

  const handleRegister = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");


    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    if (
      !cleanName ||
      !cleanEmail ||
      !password
    ) {
      setError(
        "Please fill in all fields."
      );

      return;
    }


    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );

      return;
    }


    try {
      setLoading(true);


      // --------------------------------------
      // API REQUEST
      // --------------------------------------

      const response =
        await api.post(
          "/auth/register",
          {
            name:
              cleanName,

            email:
              cleanEmail,

            password,
          }
        );


      // --------------------------------------
      // SAVE TOKEN
      // --------------------------------------

      if (
        response.data?.token
      ) {
        sessionStorage.setItem(
          "token",
          response.data.token
        );
      }


      // --------------------------------------
      // SUCCESS
      // --------------------------------------

      setSuccess(
        "Account created successfully!"
      );


      // --------------------------------------
      // REDIRECT
      // --------------------------------------

      setTimeout(() => {
        navigate("/dashboard");
      }, 700);

    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
          "Could not create account."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="register-page">

      {/* =====================================
          LEFT BRAND PANEL
      ====================================== */}

      <section className="register-brand">

        <div className="brand-content">

          <div className="brand-logo">
            🎥
          </div>

          <h1>
            Video Meeting
            <br />
            Platform
          </h1>

          <p>
            Create your account and start
            hosting secure online meetings.
          </p>

          <div className="brand-features">
            <div>
              <span>✓</span>
              Video meetings
            </div>

            <div>
              <span>✓</span>
              Real-time chat
            </div>

            <div>
              <span>✓</span>
              Participant controls
            </div>
          </div>

        </div>

      </section>


      {/* =====================================
          REGISTER PANEL
      ====================================== */}

      <section className="register-panel">

        <div className="register-card">

          <div className="register-header">

            <div className="mobile-logo">
              🎥
            </div>

            <h2>
              Create your account
            </h2>

            <p>
              Join the platform and start
              your first meeting.
            </p>

          </div>


          {/* =================================
              FORM
          ================================== */}

          <form
            className="register-form"
            onSubmit={handleRegister}
          >

            {/* NAME */}

            <div className="register-field">

              <label htmlFor="name">
                Full name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Enter your name"
                autoComplete="name"
                disabled={loading}
              />

            </div>


            {/* EMAIL */}

            <div className="register-field">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />

            </div>


            {/* PASSWORD */}

            <div className="register-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
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

              <span className="field-help">
                Use at least 8 characters.
              </span>

            </div>


            {/* ERROR */}

            {error && (
              <div className="register-message error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}


            {/* SUCCESS */}

            {success && (
              <div className="register-message success">
                <span>✓</span>
                <p>{success}</p>
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="register-spinner" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

          </form>


          {/* =================================
              LOGIN LINK
          ================================== */}

          <div className="register-footer">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Register;