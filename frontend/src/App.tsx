import React, { useState, useEffect } from 'react';
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
  const setToken = useChatStore((state) => state.setToken);

  const path = window.location.pathname;
  const defaultTab = path.includes('dm') ? 'dm' : path.includes('settings') ? 'settings' : 'chat';
  const [activeTab, setActiveTab] = useState(defaultTab);

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
      case 'chat': return <ChatPage />;
      case 'dm':   return <DirectMessages />;
      case 'settings': return <SettingsPage />;
      default:     return <ChatPage />;
    }
  };

  const navItems = [
    { id: 'chat',     icon: 'forum',    label: 'global-stream', prefix: '#' },
    { id: 'dm',       icon: 'mail',     label: 'Direct Messages', prefix: '' },
    { id: 'settings', icon: 'settings', label: 'Settings', prefix: '' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar flex flex-col h-screen">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.05]">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#4d8eff] text-[#00285d] shadow-[0_0_20px_rgba(77,142,255,0.3)]">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
          </div>
          <span className="font-extrabold tracking-tight text-[#e2e2e2] text-lg">Ekam</span>
          {/* Connection dot */}
          <div className={`ml-auto w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-[#adc6ff] shadow-[0_0_8px_rgba(173,198,255,0.6)]' : 'bg-[#424754]'}`} title={connectionStatus} />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          <p className="text-[9px] font-bold tracking-[0.3em] text-[#c2c6d6]/40 uppercase px-3 mb-2">Channels</p>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#adc6ff]/10 text-[#adc6ff] border border-[#adc6ff]/20'
                    : 'text-[#c2c6d6]/60 hover:text-[#e2e2e2] hover:bg-white/[0.05]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span>{item.prefix}{item.label}</span>
                {isActive && connectionStatus === 'connected' && (
                  <span className="ml-auto w-1.5 h-1.5 bg-[#adc6ff] rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="w-7 h-7 rounded-lg bg-[#4d8eff]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#adc6ff] text-[14px]">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#e2e2e2] truncate">You</p>
              <p className="text-[10px] text-[#c2c6d6]/40">{connectionStatus}</p>
            </div>
            <button
              onClick={() => setToken('')}
              className="text-[#c2c6d6]/30 hover:text-[#adc6ff] transition-colors cursor-pointer"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-chat-container">
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;
