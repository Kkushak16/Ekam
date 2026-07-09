import React, { useState, useEffect } from "react";
import axios from "axios";
import { useChatStore } from "../store/chatStore";
import { useToast } from "./ToastProvider";
// Removed PhoneLogin import as phone login handled in this form

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) {
    return ""; // Vite proxy handles /auth/* → backend in dev
  }
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1') && !envUrl.includes('vercel.app')) {
    return envUrl;
  }
  return 'https://ekam-backend-3b2w.onrender.com';
};
const API_URL = getApiUrl().replace(/\/$/, '');

/* ─── Inline Styles ───────────────────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Hanken Grotesk', sans-serif",
    color: "#e2e2e2",
    position: "relative",
    overflow: "hidden",
    padding: "40px 24px",
    boxSizing: "border-box",
  },
  glowTopLeft: {
    position: "absolute",
    top: "-15%",
    left: "-10%",
    width: "45%",
    height: "45%",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(77,142,255,0.12) 0%, transparent 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
    animation: "pulseGlow 5s ease-in-out infinite",
  },
  glowBottomRight: {
    position: "absolute",
    bottom: "-10%",
    right: "-5%",
    width: "40%",
    height: "40%",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(173,198,255,0.06) 0%, transparent 70%)",
    filter: "blur(80px)",
    pointerEvents: "none",
  },
  inner: {
    display: "flex",
    alignItems: "center",
    gap: 64,
    width: "100%",
    maxWidth: 1060,
    position: "relative",
    zIndex: 1,
  },
  left: {
    flex: "0 0 460px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 14px",
    borderRadius: 999,
    background: "rgba(42,42,42,0.6)",
    border: "1px solid rgba(66,71,84,0.7)",
    backdropFilter: "blur(12px)",
    color: "#adc6ff",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    alignSelf: "flex-start",
  },
  heroHeading: {
    margin: 0,
    fontWeight: 800,
    lineHeight: 0.95,
    letterSpacing: "-0.04em",
    color: "#e2e2e2",
  },
  gradientSpan: {
    background: "linear-gradient(135deg, #adc6ff 0%, #4d8eff 50%, #adc6ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSub: {
    fontSize: 16,
    color: "rgba(194,198,214,0.8)",
    lineHeight: 1.7,
    maxWidth: 440,
    margin: 0,
  },
  featurePills: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 6,
  },
  featurePill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 12,
    background: "rgba(31,31,31,0.6)",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: 13,
    fontWeight: 600,
    color: "#e2e2e2",
  },
  materialIcon: {
    fontFamily: "'Material Symbols Outlined'",
    fontWeight: "normal",
    fontStyle: "normal",
    fontSize: 20,
    lineHeight: 1,
    display: "inline-block",
    color: "#adc6ff",
    userSelect: "none",
  },
  // Card
  card: {
    flex: "0 0 420px",
    background: "rgba(12,12,12,0.75)",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    border: "1px solid rgba(77,142,255,0.18)",
    borderRadius: 32,
    padding: "36px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 22,
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 40px -10px rgba(77,142,255,0.12)",
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#e2e2e2",
    margin: 0,
  },
  cardSub: {
    display: "block",
    fontSize: 13,
    color: "rgba(194,198,214,0.6)",
    marginTop: 4,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(194,198,214,0.5)",
  },
  forgotBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: "#adc6ff",
    padding: 0,
    fontFamily: "inherit",
  },
  inputPill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 13,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    transition: "all 0.2s ease",
  },
  inputPillFocused: {
    background: "rgba(77,142,255,0.05)",
    border: "1px solid rgba(77,142,255,0.45)",
    boxShadow: "0 0 0 3px rgba(77,142,255,0.08)",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e2e2e2",
    fontSize: 15,
    fontFamily: "inherit",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    lineHeight: 0,
  },
  errorBox: {
    background: "rgba(255,180,171,0.07)",
    border: "1px solid rgba(255,180,171,0.2)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#ffb4ab",
    lineHeight: 1.5,
  },
  successBox: {
    background: "rgba(173,198,255,0.07)",
    border: "1px solid rgba(173,198,255,0.2)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#adc6ff",
    lineHeight: 1.5,
  },
  btnPrimary: {
    width: "100%",
    padding: "14px 24px",
    borderRadius: 13,
    background: "#4d8eff",
    color: "#002e6a",
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 8px 24px rgba(77,142,255,0.3)",
    transition: "all 0.2s ease",
  },
  btnSecondary: {
    width: "100%",
    padding: "12px 24px",
    borderRadius: 13,
    background: "rgba(40,40,40,0.6)",
    color: "#e2e2e2",
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 600,
    border: "1px solid rgba(255,255,255,0.07)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 0.2s ease",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "rgba(255,255,255,0.05)",
  },
  dividerLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "rgba(194,198,214,0.4)",
    textTransform: "uppercase" as const,
  },
  phoneBtn: {
    width: "100%",
    padding: "12px 24px",
    borderRadius: 13,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e2e2",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    transition: "all 0.2s ease",
  },
  tosText: {
    fontSize: 11,
    color: "rgba(194,198,214,0.3)",
    textAlign: "center",
    margin: 0,
    lineHeight: 1.6,
  },
  tosLink: {
    color: "rgba(194,198,214,0.55)",
    textDecoration: "underline",
    cursor: "pointer",
  },
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export function LoginForm() {
  const setToken = useChatStore((s) => s.setToken);
  const toast = useToast?.();

  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState("");   // phone number or username
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  // Focus states
  const [idFocus, setIdFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);
  const [dnFocus, setDnFocus] = useState(false);
  const [unFocus, setUnFocus] = useState(false);

  // Responsive
  const [isMobile, setIsMobile] = useState(window.innerWidth < 820);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 820);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* ── Submit ─────────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    // Basic validation
    if (isSignUp && !displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    if (isSignUp && !username.trim()) {
      setError("Username is required.");
      return;
    }
    if (!identifier.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    if (isSignUp && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const endpoint = isSignUp ? `${API_URL}/auth/register` : `${API_URL}/auth/login`;
      const payload = isSignUp
        ? (isEmail 
            ? { email: identifier.trim(), password, displayName: displayName.trim(), username: username.trim() }
            : { phone: identifier.trim(), password, displayName: displayName.trim(), username: username.trim() })
        : { identifier: identifier.trim(), password };

      const { data } = await axios.post(endpoint, payload);
      const token = data?.accessToken || data?.token;
      if (token) {
        setToken(token);
      } else if (isSignUp) {
        setInfo("Account created! You can now sign in.");
        setIsSignUp(false);
        setPassword("");
        setIdentifier("");
        setUsername("");
      }
    } catch (err: any) {
      let msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Something went wrong. Please try again.";

      if (msg && typeof msg === "object") {
        msg = msg.message || msg.code || JSON.stringify(msg);
      }

      // Auto-switch to login if duplicate email
      if (err.response?.status === 409) {
        if (msg.toLowerCase().includes('taken')) {
          setError(msg);
        } else {
          setError(msg + " Switched to Sign In.");
          setIsSignUp(false);
          setPassword("");
        }
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Derived ─────────────────────────────────────────────────────────── */
  const canSubmit = !loading && identifier.trim() && password;
  const heroSize = isMobile ? 42 : 68;

  const innerStyle: React.CSSProperties = {
    ...S.inner,
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? 28 : 64,
    alignItems: isMobile ? "stretch" : "center",
  };

  return (
    <div style={S.page}>
      {/* Background glows */}
      <div style={S.glowTopLeft} />
      <div style={S.glowBottomRight} />

      <div style={innerStyle}>
        {/* ── LEFT: Hero ── */}
        <div style={{ ...S.left, flex: isMobile ? "unset" : "0 0 460px", alignItems: isMobile ? "center" : "flex-start", textAlign: isMobile ? "center" : "left" }}>
          {/* Badge */}
          <div style={S.badge}>
            <span style={S.materialIcon}>auto_awesome</span>
            Ekam Evolution
          </div>

          {/* Heading */}
          <h1 style={{ ...S.heroHeading, fontSize: heroSize }}>
            Welcome to
            <br />
            <span style={S.gradientSpan}>Ekam.</span>
          </h1>

          <p style={S.heroSub}>
            Experience the next frontier of secure, high-fidelity communication.
            Minimalist by design, powerful by nature.
          </p>

          {/* Feature pills */}
          <div style={{ ...S.featurePills, justifyContent: isMobile ? "center" : "flex-start" }}>
            <div style={S.featurePill}>
              <span style={S.materialIcon}>verified_user</span>
              End-to-end Encrypted
            </div>
            <div style={S.featurePill}>
              <span style={S.materialIcon}>bolt</span>
              Instant Delivery
            </div>
          </div>
        </div>

        {/* ── RIGHT: Auth Card ── */}
        <div style={{ ...S.card, flex: isMobile ? "unset" : "0 0 420px" }}>

          {/* Direct form handles both sign‑up and sign‑in */}
          <>
              <div>
                <h2 style={S.cardTitle}>
                  {isSignUp ? "Create Account" : "Secure Sign-in"}
                </h2>
                <span style={S.cardSub}>
                  {isSignUp
                    ? "Join Ekam and start messaging securely."
                    : "Access your encrypted workspace."}
                </span>
              </div>

              {/* Error / Info banners */}
              {error && <div style={S.errorBox}>{error}</div>}
              {info && <div style={S.successBox}>{info}</div>}

              <form style={S.form} onSubmit={handleSubmit} noValidate>
                {/* Display Name (sign-up only) */}
                {isSignUp && (
                  <div style={S.fieldGroup}>
                    <label style={S.fieldLabel}>Display Name</label>
                    <div style={{ ...S.inputPill, ...(dnFocus ? S.inputPillFocused : {}) }}>
                      <span style={S.materialIcon}>person</span>
                      <input
                        style={S.input}
                        placeholder="Your name"
                        type="text"
                        autoComplete="name"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        onFocus={() => setDnFocus(true)}
                        onBlur={() => setDnFocus(false)}
                      />
                    </div>
                  </div>
                )}

                {/* Username (sign-up only) */}
                {isSignUp && (
                  <div style={S.fieldGroup}>
                    <label style={S.fieldLabel}>Username</label>
                    <div style={{ ...S.inputPill, ...(unFocus ? S.inputPillFocused : {}) }}>
                      <span style={S.materialIcon}>alternate_email</span>
                      <input
                        style={S.input}
                        placeholder="Choose a unique username"
                        type="text"
                        autoComplete="username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onFocus={() => setUnFocus(true)}
                        onBlur={() => setUnFocus(false)}
                      />
                    </div>
                  </div>
                )}

                {/* Identifier — email or username */}
                <div style={S.fieldGroup}>
                  <label style={S.fieldLabel}>
                    {isSignUp ? "Email Address" : "Email or Username"}
                  </label>
                  <div style={{ ...S.inputPill, ...(idFocus ? S.inputPillFocused : {}) }}>
                    <span style={S.materialIcon}>account_circle</span>
                    <input
                      style={S.input}
                      placeholder={isSignUp ? "you@email.com" : "Email or username"}
                      type={isSignUp ? "email" : "text"}
                      autoComplete={isSignUp ? "email" : "username"}
                      required
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      onFocus={() => setIdFocus(true)}
                      onBlur={() => setIdFocus(false)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={S.fieldGroup}>
                  <div style={S.labelRow}>
                    <label style={S.fieldLabel}>Password</label>
                    {!isSignUp && (
                      <button type="button" style={S.forgotBtn}>Forgot?</button>
                    )}
                  </div>
                  <div style={{ ...S.inputPill, ...(pwFocus ? S.inputPillFocused : {}) }}>
                    <span style={S.materialIcon}>lock</span>
                    <input
                      style={S.input}
                      placeholder={isSignUp ? "Min. 8 characters" : "••••••••"}
                      type={showPw ? "text" : "password"}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setPwFocus(true)}
                      onBlur={() => setPwFocus(false)}
                    />
                    <button
                      type="button"
                      style={S.iconBtn}
                      onClick={() => setShowPw(!showPw)}
                      tabIndex={-1}
                    >
                      <span style={{ ...S.materialIcon, color: showPw ? "#adc6ff" : "rgba(194,198,214,0.4)" }}>
                        {showPw ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    style={{
                      ...S.btnPrimary,
                      opacity: canSubmit ? 1 : 0.55,
                      cursor: canSubmit ? "pointer" : "not-allowed",
                    }}
                    onMouseEnter={e => { if (canSubmit) (e.currentTarget as HTMLElement).style.filter = "brightness(1.12)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "brightness(1)"; }}
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        {isSignUp ? "Create Account" : "Sign In"}
                        <span style={{ ...S.materialIcon, color: "#002e6a", fontSize: 18 }}>arrow_forward</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    style={S.btnSecondary}
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                      setInfo("");
                      setPassword("");
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(55,55,55,0.7)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(40,40,40,0.6)"; }}
                  >
                    {isSignUp ? "Already have an account? Sign In" : "Create Account"}
                  </button>
                </div>
              </form>



              {/* ToS */}
              <p style={S.tosText}>
                By signing in, you agree to our{" "}
                <a 
                  href="/terms" 
                  style={S.tosLink}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState(null, '', '/terms');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                >
                  Terms of Service
                </a>
                {" "}and{" "}
                <a 
                  href="/privacy" 
                  style={S.tosLink}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState(null, '', '/privacy');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                >
                  Privacy Policy
                </a>.
              </p>
            </>

        </div>
      </div>
    </div>
  );
}

export default LoginForm;