import React from 'react';
import { useChatStore } from '../store/chatStore';

export function SettingsPage() {
  const clearAuth = useChatStore((state) => state.clearAuth);
  const token = useChatStore((state) => state.token);
  const parseJwt = useChatStore((state) => state.parseJwt);
  
  let displayName = 'devuser';
  if (token) {
    try {
      const payload = parseJwt(token);
      displayName = payload.displayName || payload.email?.split('@')[0] || 'devuser';
    } catch (e) {}
  }
  
  return (
    <div style={{ padding: '32px', color: 'var(--text-primary)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>⚙️ Workspace Settings</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Configure your system preferences and account nodes.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-premium)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Profile Details</h3>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Display Username</label>
          <input 
            type="text" 
            value={displayName} 
            disabled
            style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px', borderRadius: '8px', width: '100%', maxWidth: '300px', outline: 'none', opacity: 0.8 }} 
          />
        </div>

        <div style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-premium)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#ef4444' }}>Danger Zone</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Disconnect your session from the server node.</p>
          <button
            onClick={() => clearAuth()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Log Out Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
