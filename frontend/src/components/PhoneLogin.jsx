import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axios from "axios";

// Firebase Configuration — uses Vite env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) {
    return "";
  }
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  return window.location.origin;
};
const API_URL = getApiUrl().replace(/\/$/, '');

let firebaseApp = null;
let firebaseAuth = null;

try {
  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
} catch (err) {
  console.warn("Firebase init deferred — missing config:", err.message);
}

/* ─── Inline Styles (Sapphire Dark Theme) ─────────────────────────────────── */
const S = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    color: "rgba(194,198,214,0.5)",
    transition: "color 0.2s ease",
    fontFamily: "'Material Symbols Outlined'",
    fontWeight: "normal",
    fontStyle: "normal",
    fontSize: 22,
    lineHeight: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#e2e2e2",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(194,198,214,0.6)",
    lineHeight: 1.6,
    marginBottom: 4,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(194,198,214,0.5)",
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
    marginTop: 4,
  },
  otpRow: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
    marginTop: 4,
  },
  otpDigit: {
    width: 48,
    height: 56,
    borderRadius: 12,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e2e2",
    fontSize: 24,
    fontWeight: 700,
    textAlign: "center",
    fontFamily: "'Geist', monospace",
    outline: "none",
    transition: "all 0.2s ease",
  },
  otpDigitFocused: {
    background: "rgba(77,142,255,0.05)",
    border: "1px solid rgba(77,142,255,0.45)",
    boxShadow: "0 0 0 3px rgba(77,142,255,0.08)",
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
  resendRow: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
    fontSize: 12,
    color: "rgba(194,198,214,0.4)",
  },
  resendBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    color: "#adc6ff",
    fontFamily: "inherit",
    padding: 0,
    textDecoration: "underline",
  },
  timerText: {
    fontSize: 12,
    color: "rgba(194,198,214,0.4)",
    fontWeight: 600,
  },
};

export default function PhoneLogin({ onBack, onLoginSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [phoneFocus, setPhoneFocus] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef([]);
  const recaptchaRef = useRef(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Setup invisible reCAPTCHA
  const setupRecaptcha = () => {
    if (!firebaseAuth) {
      setError("Firebase is not configured. Please set up Firebase environment variables.");
      return false;
    }
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaRef.current, {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          window.recaptchaVerifier = null;
        },
      });
    }
    return true;
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setInfo("");

    // Validate phone number format
    const cleaned = phoneNumber.trim();
    if (!cleaned.startsWith("+") || cleaned.length < 10) {
      setError("Please enter your full phone number with country code (e.g. +919876543210)");
      return;
    }

    if (!setupRecaptcha()) return;

    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(firebaseAuth, cleaned, appVerifier);
      window.confirmationResult = confirmationResult;
      setStep("otp");
      setCountdown(60);
      setInfo("OTP sent to " + cleaned);
    } catch (err) {
      console.error("SMS Delivery Failed:", err);
      // Reset reCAPTCHA on failure
      window.recaptchaVerifier = null;

      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number. Include country code (e.g. +91).");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait before trying again.");
      } else if (err.code === "auth/quota-exceeded") {
        setError("SMS quota exceeded. Please try again later.");
      } else {
        setError("Failed to send OTP. Please check your number and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit input
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste into OTP fields
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex(d => !d);
    otpRefs.current[nextEmpty >= 0 ? nextEmpty : 5]?.focus();
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    setInfo("");

    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(code);
      const user = result.user;
      const idToken = await user.getIdToken();

      // Exchange Firebase token for Ekam JWT
      try {
        const { data } = await axios.post(`${API_URL}/auth/phone`, {
          idToken,
          phoneNumber: user.phoneNumber,
          uid: user.uid,
        });
        const token = data?.accessToken || data?.token;
        if (token && onLoginSuccess) {
          onLoginSuccess(token);
        } else {
          setError("Authentication succeeded but no session token was returned.");
        }
      } catch (apiErr) {
        setError(apiErr.response?.data?.error || "Failed to create session. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      if (err.code === "auth/invalid-verification-code") {
        setError("Incorrect OTP code. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("OTP has expired. Please request a new one.");
        setStep("phone");
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = () => {
    if (countdown > 0) return;
    window.recaptchaVerifier = null;
    setOtp(["", "", "", "", "", ""]);
    handleSendOtp();
  };

  const otpFull = otp.every(d => d);

  return (
    <div style={S.wrapper}>
      {/* Hidden reCAPTCHA container */}
      <div ref={recaptchaRef} id="recaptcha-container" />

      {/* Header with back button */}
      <div style={S.header}>
        <button
          style={S.backBtn}
          onClick={onBack}
          title="Back to login"
          onMouseEnter={e => { e.currentTarget.style.color = "#adc6ff"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(194,198,214,0.5)"; }}
        >
          arrow_back
        </button>
        <span style={S.title}>
          {step === "phone" ? "Phone Verification" : "Enter OTP"}
        </span>
      </div>

      <p style={S.subtitle}>
        {step === "phone"
          ? "Enter your mobile number with country code to receive a one-time verification code."
          : `A 6-digit code has been sent to ${phoneNumber}`}
      </p>

      {/* Error / Info */}
      {error && <div style={S.errorBox}>{error}</div>}
      {info && step === "otp" && <div style={S.successBox}>{info}</div>}

      {step === "phone" ? (
        /* ── Phone Number Entry ──────────────────────────── */
        <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={S.fieldGroup}>
            <label style={S.fieldLabel}>Phone Number</label>
            <div style={{ ...S.inputPill, ...(phoneFocus ? S.inputPillFocused : {}) }}>
              <span style={S.materialIcon}>phone</span>
              <input
                style={S.input}
                type="tel"
                placeholder="+919876543210"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                onFocus={() => setPhoneFocus(true)}
                onBlur={() => setPhoneFocus(false)}
                autoComplete="tel"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !phoneNumber.trim()}
            style={{
              ...S.btnPrimary,
              opacity: loading || !phoneNumber.trim() ? 0.55 : 1,
              cursor: loading || !phoneNumber.trim() ? "not-allowed" : "pointer",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = "brightness(1.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
          >
            {loading ? (
              <>
                <span style={{ ...S.materialIcon, animation: "spin 1s linear infinite", color: "#002e6a" }}>
                  progress_activity
                </span>
                Sending OTP...
              </>
            ) : (
              <>
                Send Verification Code
                <span style={{ ...S.materialIcon, color: "#002e6a", fontSize: 18 }}>arrow_forward</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* ── OTP Entry ──────────────────────────── */
        <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* 6-digit OTP boxes */}
          <div style={S.otpRow} onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => (otpRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                onFocus={e => {
                  e.target.style.background = "rgba(77,142,255,0.05)";
                  e.target.style.border = "1px solid rgba(77,142,255,0.45)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(77,142,255,0.08)";
                }}
                onBlur={e => {
                  e.target.style.background = "rgba(255,255,255,0.03)";
                  e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                  e.target.style.boxShadow = "none";
                }}
                style={S.otpDigit}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {/* Resend / countdown */}
          <div style={S.resendRow}>
            {countdown > 0 ? (
              <span style={S.timerText}>Resend in {countdown}s</span>
            ) : (
              <>
                <span>Didn't receive it?</span>
                <button type="button" style={S.resendBtn} onClick={handleResend}>
                  Resend OTP
                </button>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !otpFull}
            style={{
              ...S.btnPrimary,
              opacity: loading || !otpFull ? 0.55 : 1,
              cursor: loading || !otpFull ? "not-allowed" : "pointer",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = "brightness(1.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.filter = "brightness(1)"; }}
          >
            {loading ? (
              <>
                <span style={{ ...S.materialIcon, animation: "spin 1s linear infinite", color: "#002e6a" }}>
                  progress_activity
                </span>
                Verifying...
              </>
            ) : (
              <>
                Verify & Sign In
                <span style={{ ...S.materialIcon, color: "#002e6a", fontSize: 18 }}>verified</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
