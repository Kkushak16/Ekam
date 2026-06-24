import React, { useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useChatStore } from '../store/chatStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const setToken = useChatStore((state) => state.setToken);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const resp = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      return resp.data as { token: string };
    },
    onSuccess: (data) => {
      setToken(data.token);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || err.response?.data?.error || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div 
      className="login-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        padding: '24px'
      }}
    >
      <div 
        className="login-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          color: '#ffffff',
          animation: 'fadeInUp 0.6s ease'
        }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.5px' }}>
          Ekam Hub
        </h2>
        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '32px', textAlign: 'center' }}>
          Secure, real-time message stream gateway
        </p>

        {errorMsg && (
          <div 
            style={{ 
              padding: '12px 16px', 
              background: 'rgba(239, 68, 68, 0.2)', 
              border: '1px solid rgba(239, 68, 68, 0.4)', 
              borderRadius: '12px', 
              color: '#fca5a5', 
              fontSize: '14px', 
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', opacity: 0.9 }}>EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loginMutation.isPending}
              style={{
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#ffffff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', opacity: 0.9 }}>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loginMutation.isPending}
              style={{
                padding: '14px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#ffffff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{
              marginTop: '10px',
              padding: '14px',
              background: '#ffffff',
              color: '#4f46e5',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '16px',
              cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!loginMutation.isPending) {
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {loginMutation.isPending ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
