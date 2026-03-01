import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../config/api";
import "./css/Login.css";

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  const formRef = useRef(null);
  const animationTimeout = useRef(null);

  useEffect(() => {
    animationTimeout.current = setTimeout(
      () => setIsAnimated(true),
      100
    );

    return () => clearTimeout(animationTimeout.current);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", formData);

      if (response?.data?.token) {
        api.setTokens(
          response.data.token,
          response.data.refreshToken
        );

        const form = formRef.current;

        if (form) {
          form.style.transform = "scale(0.95)";

          setTimeout(() => {
            form.style.transform = "scale(1)";
            onLogin?.();
          }, 150);
        }
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login ou senha inválidos.";

      setError(message);

      const form = formRef.current;

      if (form) {
        form.style.animation = "shake 0.5s";
        setTimeout(() => {
          form.style.animation = "";
        }, 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-overlay"></div>

        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className={`login-card ${isAnimated ? "animated" : ""}`}>
        <div className="login-header">
          <div className="logo-container">
            <div className="logo">
              <span className="logo-text">CG</span>
            </div>
          </div>

          <h1 className="login-title">Painel Administrativo</h1>
          <p className="login-subtitle">ChamaGol</p>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="login-form"
        >
          <div className="form-group">
            <label htmlFor="login" className="form-label">
              <span className="label-text">Login</span>
            </label>

            <div className="input-wrapper">
              <input
                type="text"
                id="login"
                name="login"
                value={formData.login}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Digite seu login"
                required
                autoComplete="username"
              />

              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="label-text">Senha</span>
            </label>

            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Digite sua senha"
                required
                autoComplete="current-password"
              />

              <div className="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>

              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={
                  showPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${
              loading ? "loading" : ""
            }`}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="footer-text">
            © 2026 ChamaGol. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}