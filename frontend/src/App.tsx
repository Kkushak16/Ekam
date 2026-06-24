import React, { useState, useEffect } from 'react';
import ThemeToggle from './components/ThemeToggle';
import ChatPage from './components/ChatPage';
import SettingsPage from './pages/SettingsPage';
import DirectMessages from './pages/DirectMessages';
import LoginForm from './components/LoginForm';
import { useChatStore } from './store/chatStore';

export function App() {
  const token = useChatStore((state) => state.token);
  const initializeSocket = useChatStore((state) => state.initializeSocket);
  const disconnectSocket = useChatStore((state) => state.disconnectSocket);
  const connectionStatus = useChatStore((state) => state.connectionStatus);

  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (token && typeof token === 'string' && token.trim().length > 0) {
      initializeSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token, initializeSocket, disconnectSocket]);

  if (!token) {
    return <LoginForm />;
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatPage />;
      case 'dm':
        return <DirectMessages />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ChatPage />;
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>🚀 Ekam Hub</h2>
          <ThemeToggle />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px' }}>
            CHANNELS
          </div>
          
          <button 
            onClick={() => setActiveTab('chat')} 
            style={{ 
              padding: '12px 16px', 
              background: activeTab === 'chat' ? 'var(--accent-glow)' : 'transparent', 
              color: activeTab === 'chat' ? 'var(--bg-bubble-me)' : 'var(--text-primary)', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: '600', 
              fontSize: '14px', 
              textAlign: 'left', 
              cursor: 'pointer', 
              width: '100%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span># global-stream</span>
            {activeTab === 'chat' && connectionStatus === 'connected' && (
              <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', marginLeft: 'auto' }} />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('dm')} 
            style={{ 
              padding: '12px 16px', 
              background: activeTab === 'dm' ? 'var(--accent-glow)' : 'transparent', 
              color: activeTab === 'dm' ? 'var(--bg-bubble-me)' : 'var(--text-primary)', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: '600', 
              fontSize: '14px', 
              textAlign: 'left', 
              cursor: 'pointer', 
              width: '100%' 
            }}
          >
            ✉️ Direct Messages
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            style={{ 
              padding: '12px 16px', 
              background: activeTab === 'settings' ? 'var(--accent-glow)' : 'transparent', 
              color: activeTab === 'settings' ? 'var(--bg-bubble-me)' : 'var(--text-primary)', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: '600', 
              fontSize: '14px', 
              textAlign: 'left', 
              cursor: 'pointer', 
              width: '100%' 
            }}
          >
            ⚙️ Workspace Settings
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: '12px 16px', background: 'var(--bg-app)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connectionStatus === 'connected' ? '#10b981' : '#f59e0b' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            Status: {connectionStatus}
          </span>
        </div>
      </aside>

      <main className="main-chat-container">
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;
