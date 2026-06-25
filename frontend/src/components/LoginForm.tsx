import React, { useState } from "react";
import axios from "axios";
import { useChatStore } from "../store/chatStore";
import { useToast } from "./ToastProvider";

const API_URL = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:3001') : window.location.origin;

export function LoginForm() {
  const setToken = useChatStore((state) => state.setToken);
  const toast = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isSignUp ? `${API_URL}/auth/register` : `${API_URL}/auth/login`;

      const payload = isSignUp 
        ? { email, password, displayName: username } 
        : { email, password };

      const response = await axios.post(endpoint, payload);
      const token = response.data?.accessToken || response.data?.token;

      if (token) {
        setToken(token);
      } else if (isSignUp) {
        toast("Account created successfully! Please log in.", "success");
        setIsSignUp(false);
        setPassword("");
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        "Authentication failed. Please verify network configuration and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-on-surface antialiased font-body-md relative flex flex-col md:flex-row items-center justify-center p-gutter md:p-margin-desktop gap-xl overflow-x-hidden">
      {/* Hero Background Animation */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary-container/5 blur-[150px]"></div>
      </div>

      {/* Typography Section */}
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-md z-10">
        <div className="inline-flex items-center space-x-xs px-sm py-base rounded-full bg-surface-container-high/50 border border-outline-variant/30 text-primary animate-float">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="font-label-caps text-[10px] tracking-[0.25em] uppercase font-bold">Ekam Evolution</span>
        </div>
        <div className="space-y-base">
          <h1 className="font-display-lg text-[56px] md:text-[92px] leading-[0.95] font-extrabold tracking-[-0.04em] text-on-surface">
            Welcome to <br className="hidden md:block"/>
            <span className="text-gradient-sapphire">Ekam.</span>
          </h1>
        </div>
        <p className="font-body-lg text-on-surface-variant max-w-[480px] leading-relaxed opacity-90">
          Experience the next frontier of secure, high-fidelity communication. Minimalist by design, powerful by nature.
        </p>
        <div className="hidden md:flex flex-wrap gap-sm mt-lg">
          <div className="gem-badge px-md py-sm rounded-xl flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
            <span className="font-label-mono text-label-mono tracking-tight">End-to-end Encrypted</span>
          </div>
          <div className="gem-badge px-md py-sm rounded-xl flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
            <span className="font-label-mono text-label-mono tracking-tight">Instant Delivery</span>
          </div>
        </div>
      </div>

      {/* Auth Form Section */}
      <div className="w-full max-w-[440px] md:w-1/2 z-10">
        <div className="glass-card-sapphire p-lg md:p-xl rounded-[2.5rem] flex flex-col gap-lg">
          <div className="space-y-base">
            <h2 className="font-headline-md text-headline-md tracking-tight text-on-surface">
              {isSignUp ? "Create an Account" : "Secure Sign-in"}
            </h2>
            <p className="font-label-md text-on-surface-variant opacity-80">
              {isSignUp ? "Register to start messaging." : "Access your encrypted workspace."}
            </p>
          </div>

          {error && (
            <div className="inline-error">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="space-y-xs">
                <label className="font-label-caps text-[10px] tracking-widest text-on-surface-variant/70 ml-xs">DISPLAY NAME</label>
                <div className="input-pill flex items-center px-md py-sm rounded-xl transition-all duration-300">
                  <span className="material-symbols-outlined text-on-surface-variant/50 mr-sm">person</span>
                  <input 
                    className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant/50 font-body-md outline-none"
                    placeholder="Ekam User"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-xs">
              <label className="font-label-caps text-[10px] tracking-widest text-on-surface-variant/70 ml-xs">
                {isSignUp ? "EMAIL ADDRESS" : "IDENTIFIER"}
              </label>
              <div className="input-pill flex items-center px-md py-sm rounded-xl transition-all duration-300">
                <span className="material-symbols-outlined text-on-surface-variant/50 mr-sm">account_circle</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant/50 font-body-md outline-none"
                  placeholder={isSignUp ? "you@example.com" : "Username or Email"} 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-xs">
              <div className="flex justify-between items-center px-xs">
                <label className="font-label-caps text-[10px] tracking-widest text-on-surface-variant/70">PASSWORD</label>
                {!isSignUp && (
                  <a className="font-label-caps text-[10px] tracking-widest text-primary hover:text-primary-container transition-colors" href="#">FORGOT?</a>
                )}
              </div>
              <div className="input-pill flex items-center px-md py-sm rounded-xl transition-all duration-300">
                <span className="material-symbols-outlined text-on-surface-variant/50 mr-sm">lock_open</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 w-full text-on-surface placeholder:text-outline-variant/50 font-body-md outline-none"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  className="text-on-surface-variant/50 hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-sm mt-md">
              {/* Primary Action Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-md px-lg bg-primary-container text-on-primary-container font-headline-sm rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm shadow-[0_8px_30px_rgba(77,142,255,0.2)] cursor-pointer"
              >
                {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              {/* Toggle Mode Button */}
              <button 
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="w-full py-md px-lg bg-surface-container-high/5 border border-white/5 text-on-surface font-headline-sm rounded-xl hover:bg-surface-variant active:scale-[0.98] transition-all flex items-center justify-center gap-sm cursor-pointer"
              >
                {isSignUp ? "Already have an account? Sign In" : "Create Account"}
              </button>
            </div>
          </form>

          <div className="relative py-sm">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] font-bold tracking-[0.2em]">
              <span className="bg-surface-container-lowest/80 px-sm text-on-surface-variant/60">OR FEDERATED</span>
            </div>
          </div>

          <div className="flex gap-md">
            <button className="flex-1 py-sm bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors flex justify-center items-center gap-xs cursor-pointer">
              <div className="w-5 h-5 bg-contain bg-no-repeat bg-center opacity-80" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDMA8BIdVay3NEeNo45g-FDlt0MA8moUT1-qcCti5H8BD_p_uDaSm0HGQjP7u2o8SCwbGTBirFgA5vElSWlplb21iVyBdwR11f7-p-7rz0Eq9L1dfP1X31GSP3bLkJ2CXKewikSUYeDhTaodiurbj3A8r_b_doz8zDPAG20p4e7KWCljkleUlDOx2XQs27kwb_xFdTYtj1RIrjIoajEfB6OVLz7pCCkny2CZxZtNHM6BrEcgITiupoiQskRQ7VenN2nyCAYAqDVR209')" }}></div>
              <span className="font-label-mono text-[13px]">Google</span>
            </button>
            <button className="flex-1 py-sm bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors flex justify-center items-center gap-xs cursor-pointer">
              <div className="w-5 h-5 bg-contain bg-no-repeat bg-center opacity-80" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD8EW_HWRWCNdJPku659bW8Me5mSHCtP7hp4oNqcPV_xt_46YVQRH-ACq9bIQkpFgIy4bfSuC4n3Sp78ZSjgvc8TxBmUV9ooimTwLggbG83x5nL_KmS9p91G2LHN2e5s966ekbWs6Tt1Pc7WtmYVyi432nfSeC2irwJuUrw0NgzxlGZXJAwkzv4RS3oP3BjmycSiKlLeYxEpFEYoK5I_w-NY2GCBJbkkYm9gpOXVtzG_qLZROkGA8z4p7sNcu6_-wdPP46CeXsps6Hx')" }}></div>
              <span className="font-label-mono text-[13px]">Apple</span>
            </button>
          </div>
        </div>
        <p className="text-center mt-lg font-label-sm text-on-surface-variant/40">
          By signing in, you agree to our <a className="underline hover:text-on-surface transition-colors" href="#">Terms of Service</a> and <a className="underline hover:text-on-surface transition-colors" href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

export default LoginForm;