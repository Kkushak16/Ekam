import React, { useState } from "react";
import axios from "axios";
import { useChatStore } from "../store/chatStore";

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "https://ekam-backend-3b2w.onrender.com";

export function LoginForm() {
  const setToken = useChatStore((state) => state.setToken);
  
  // State management for form data and toggle states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Used during signup
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Determine backend endpoints dynamically based on mode
      const endpoint = isSignUp ? `${API_URL}/auth/register` : `${API_URL}/auth/login`;
      
      const payload = isSignUp 
        ? { email, password, displayName: username } 
        : { email, password };

      const response = await axios.post(endpoint, payload);
      const token = response.data?.accessToken || response.data?.token;

      if (token) {
        // Feed token to Zustand to transition App.jsx past the login wall
        setToken(token);
      } else if (isSignUp) {
        // If registration succeeded but didn't auto-login, redirect to login mode
        alert("Account created successfully! Please log in.");
        setIsSignUp(false);
        setPassword("");
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      setError(
        err.response?.data?.message || 
        "Authentication failed. Please verify network configuration and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "var(--bg-app, #0f172a)",
      fontFamily: "inherit"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        padding: "40px",
        borderRadius: "16px",
        backgroundColor: "var(--bg-sidebar, #1e293b)",
        border: "1px solid var(--border-color, #334155)",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        boxSizing: "border-box"
      }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "700",
          textAlign: "center",
          color: "var(--text-primary, #f8fafc)",
          marginBottom: "8px"
        }}>
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        <p style={{
          fontSize: "14px",
          color: "var(--text-secondary, #94a3b8)",
          textAlign: "center",
          marginBottom: "24px"
        }}>
          {isSignUp ? "Sign up to join the Ekam workspace" : "Log in to access your dashboard"}
        </p>

        {error && (
          <div style={{
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            color: "#f87171",
            fontSize: "13px",
            marginBottom: "16px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isSignUp && (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-secondary, #94a3b8)", marginBottom: "6px", letterSpacing: "0.5px" }}>USERNAME</label>
              <input
                type="text"
                required
                placeholder="ekam_user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--bg-app, #0f172a)", border: "1px solid var(--border-color, #334155)", color: "var(--text-primary, #f8fafc)", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-secondary, #94a3b8)", marginBottom: "6px", letterSpacing: "0.5px" }}>EMAIL ADDRESS</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--bg-app, #0f172a)", border: "1px solid var(--border-color, #334155)", color: "var(--text-primary, #f8fafc)", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-secondary, #94a3b8)", marginBottom: "6px", letterSpacing: "0.5px" }}>PASSWORD</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--bg-app, #0f172a)", border: "1px solid var(--border-color, #334155)", color: "var(--text-primary, #f8fafc)", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: "var(--bg-bubble-me, #3b82f6)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              transition: "transform 0.1s ease",
              marginTop: "8px"
            }}
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px" }}>
          <span style={{ color: "var(--text-secondary, #94a3b8)" }}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#3b82f6",
              fontWeight: "600",
              cursor: "pointer",
              padding: "0",
              textDecoration: "underline"
            }}
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;