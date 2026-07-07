import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { apiClient } from '../api/queries';

export function SettingsPage() {
  const clearAuth = useChatStore((state) => state.clearAuth);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [lastUsernameChange, setLastUsernameChange] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingUsername, setSavingUsername] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchProfile = async () => {
    try {
      const { data } = await apiClient.get('/api/users/me');
      if (data?.user) {
        setDisplayName(data.user.display_name || '');
        setEmail(data.user.email || '');
        setUsername(data.user.username || '');
        setLastUsernameChange(data.user.last_username_change || null);
      }
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setMessage({ text: 'Failed to load user profile.', type: 'error' });
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Calculate days remaining for cooldown
  const getCooldownStatus = () => {
    if (!lastUsernameChange) return { canChange: true, remainingDays: 0 };
    const lastChange = new Date(lastUsernameChange);
    const now = new Date();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const elapsed = now.getTime() - lastChange.getTime();
    if (elapsed < sevenDaysInMs) {
      const remainingMs = sevenDaysInMs - elapsed;
      const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      return { canChange: false, remainingDays };
    }
    return { canChange: true, remainingDays: 0 };
  };

  const { canChange, remainingDays } = getCooldownStatus();

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    
    if (cleanUsername === '') {
      setMessage({ text: 'Username cannot be empty.', type: 'error' });
      return;
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setMessage({ text: 'Username can only contain alphanumeric characters and underscores.', type: 'error' });
      return;
    }

    if (cleanUsername.length < 3) {
      setMessage({ text: 'Username must be at least 3 characters long.', type: 'error' });
      return;
    }

    setSavingUsername(true);
    setMessage(null);
    try {
      const { data } = await apiClient.put('/api/users/username', { username: cleanUsername });
      if (data.success) {
        setUsername(data.username);
        // Update cooldown locally by fetching profile
        await fetchProfile();
        setMessage({ text: 'Username updated successfully!', type: 'success' });
      }
    } catch (err: any) {
      console.error('Failed to update username:', err);
      const errMsg = err.response?.data?.error || 'Failed to update username. Please try again.';
      setMessage({ text: errMsg, type: 'error' });
    } finally {
      setSavingUsername(false);
    }
  };

  if (loadingProfile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#adc6ff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', animation: 'spin 1.5s linear infinite' }}>sync</span>
          <p style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '0.05em' }}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', color: 'var(--text-primary)', maxWidth: '800px', margin: '0 auto', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #html 0%, #adc6ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚙️ Profile Settings</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>Configure your identity and session configurations for the Ekam system node.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Profile Card */}
        <div style={{ 
          background: 'rgba(25,25,25,0.4)', 
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.06)', 
          padding: '28px', 
          borderRadius: '20px', 
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#adc6ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_circle</span>
            Identity Profile
          </h3>

          <form onSubmit={handleSaveUsername} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Display Name - Read Only */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(194,198,214,0.5)' }}>Display Name</label>
              <input 
                type="text" 
                value={displayName} 
                disabled
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.04)', 
                  color: 'rgba(194,198,214,0.6)', 
                  padding: '12px 14px', 
                  borderRadius: '10px', 
                  width: '100%', 
                  outline: 'none',
                  cursor: 'not-allowed'
                }} 
              />
            </div>

            {/* Email - Read Only */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(194,198,214,0.5)' }}>Email Address</label>
              <input 
                type="text" 
                value={email} 
                disabled
                style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.04)', 
                  color: 'rgba(194,198,214,0.6)', 
                  padding: '12px 14px', 
                  borderRadius: '10px', 
                  width: '100%', 
                  outline: 'none',
                  cursor: 'not-allowed'
                }} 
              />
            </div>

            {/* Username - Editable */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(194,198,214,0.5)' }}>Username</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', color: 'rgba(194,198,214,0.4)', fontWeight: '600' }}>@</span>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!canChange || savingUsername}
                  placeholder="new_username"
                  style={{ 
                    background: !canChange ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    color: !canChange ? 'rgba(194,198,214,0.5)' : '#ffffff', 
                    padding: '12px 14px 12px 28px', 
                    borderRadius: '10px', 
                    width: '100%', 
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: canChange ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'none',
                    cursor: !canChange ? 'not-allowed' : 'text'
                  }} 
                />
              </div>
              
              {/* Cooldown Warning / Info */}
              {!canChange ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffb0b0', fontSize: '12px', marginTop: '6px', fontWeight: '500' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
                  <span>Username change locked. You can change it again in <strong>{remainingDays} {remainingDays === 1 ? 'day' : 'days'}</strong>.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(194,198,214,0.4)', fontSize: '11px', marginTop: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
                  <span>Note: You can only change your username once every 7 days.</span>
                </div>
              )}
            </div>

            {/* Alert Message */}
            {message && (
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '10px', 
                fontSize: '13px', 
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: message.type === 'success' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
                color: message.type === 'success' ? '#34d399' : '#f87171',
                marginTop: '10px'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {message.type === 'success' ? 'check_circle' : 'error'}
                </span>
                <span>{message.text}</span>
              </div>
            )}

            {/* Save Button */}
            {canChange && (
              <button
                type="submit"
                disabled={savingUsername}
                style={{
                  alignSelf: 'flex-start',
                  padding: '12px 24px',
                  backgroundColor: '#4d8eff',
                  color: '#00285d',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: savingUsername ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(77,142,255,0.2)',
                  opacity: savingUsername ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!savingUsername) {
                    e.currentTarget.style.backgroundColor = '#6fa3ff';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!savingUsername) {
                    e.currentTarget.style.backgroundColor = '#4d8eff';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {savingUsername ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>sync</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                    Save Username
                  </>
                )}
              </button>
            )}

          </form>
        </div>

        {/* Danger Zone Card */}
        <div style={{ 
          background: 'rgba(239,68,68,0.03)', 
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(239,68,68,0.15)', 
          padding: '28px', 
          borderRadius: '20px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>warning</span>
            Danger Zone
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(194,198,214,0.5)', marginBottom: '20px' }}>Disconnect your local session environment from the server node.</p>
          <button
            onClick={() => clearAuth()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(239,68,68,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            Log Out Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
