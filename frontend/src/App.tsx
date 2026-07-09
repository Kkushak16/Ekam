import React, { useState, useEffect } from 'react';
import GroupsPage from './pages/GroupsPage';
import SettingsPage from './pages/SettingsPage';
import DirectMessages from './pages/DirectMessages';
import LoginForm from './components/LoginForm';
import { useChatStore } from './store/chatStore';

// Public SEO pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import DocsPage from './pages/DocsPage';
import PublicLayout from './components/PublicLayout';

/* ─── Inline Styles ───────────────────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    background: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  sidebar: {
    width: 280,
    background: 'rgba(19,19,19,0.6)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    flexShrink: 0,
    height: '100vh',
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  logoBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 12,
    background: '#4d8eff',
    color: '#00285d',
    boxShadow: '0 0 20px rgba(77,142,255,0.3)',
  },
  brandName: {
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#e2e2e2',
    fontSize: 18,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '16px 12px',
    flex: 1,
    overflowY: 'auto',
  },
  navLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.3em',
    color: 'rgba(194,198,214,0.4)',
    textTransform: 'uppercase',
    padding: '0 12px',
    marginBottom: 8,
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '10px 12px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.2s ease',
    textAlign: 'left',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
  },
  navBtnActive: {
    background: 'rgba(173,198,255,0.1)',
    color: '#adc6ff',
    border: '1px solid rgba(173,198,255,0.2)',
  },
  navBtnInactive: {
    background: 'transparent',
    color: 'rgba(194,198,214,0.6)',
    border: '1px solid transparent',
  },
  userFooter: {
    padding: '12px 12px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'rgba(77,142,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'rgba(194,198,214,0.3)',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s ease',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
    minWidth: 0,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    marginLeft: 'auto',
    animation: 'pulse 2s ease-in-out infinite',
  },
  materialIcon: {
    fontFamily: "'Material Symbols Outlined'",
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontSize: 18,
    lineHeight: 1,
    display: 'inline-block',
    userSelect: 'none',
  },
  pointerGlow: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: 9999,
    background: `radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(77, 142, 255, 0.06), transparent 40%)`,
  }
};

export function App() {
  const token = useChatStore((state) => state.token);
  const initializeSocket = useChatStore((state) => state.initializeSocket);
  const disconnectSocket = useChatStore((state) => state.disconnectSocket);
  const connectionStatus = useChatStore((state) => state.connectionStatus);
  const clearAuth = useChatStore((state) => state.clearAuth);
  const activeRoomId = useChatStore((state) => state.activeRoomId);
  const isConnected = connectionStatus === 'connected';

  const hasToken = token && typeof token === 'string' && token.trim().length > 0;

  const getTabFromPath = (pathname: string) => {
    if (pathname.includes('groups')) return 'groups';
    if (pathname.includes('settings')) return 'settings';
    if (pathname.includes('about')) return 'about';
    if (pathname.includes('contact')) return 'contact';
    if (pathname.includes('privacy')) return 'privacy';
    if (pathname.includes('terms')) return 'terms';
    if (pathname.includes('features')) return 'features';
    if (pathname.includes('pricing')) return 'pricing';
    if (pathname.includes('docs')) return 'docs';
    if (pathname.includes('login')) return 'login';
    if (pathname.includes('dm')) return 'dm';
    return hasToken ? 'dm' : 'landing';
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(window.location.pathname));

  useEffect(() => {
    if (hasToken) {
      initializeSocket(token);
    } else {
      disconnectSocket();
    }
  }, [token, hasToken, initializeSocket, disconnectSocket]);

  // URL route history synchronizer
  useEffect(() => {
    const routeMap: Record<string, string> = {
      landing: '/',
      login: '/login',
      about: '/about',
      contact: '/contact',
      privacy: '/privacy',
      terms: '/terms',
      features: '/features',
      pricing: '/pricing',
      docs: '/docs',
      dm: '/dm',
      groups: '/groups',
      settings: '/settings'
    };
    const targetPath = routeMap[activeTab] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [activeTab]);

  useEffect(() => {
    const routeMap: Record<string, string> = {
      landing: '/',
      login: '/login',
      about: '/about',
      contact: '/contact',
      privacy: '/privacy',
      terms: '/terms',
      features: '/features',
      pricing: '/pricing',
      docs: '/docs',
      dm: '/dm',
      groups: '/groups',
      settings: '/settings'
    };
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      const matchingTab = Object.keys(routeMap).find(key => routeMap[key] === currentPath) || (token ? 'dm' : 'landing');
      setActiveTab(matchingTab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [token]);

  // Pointer-following glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isPublicPage = ['landing', 'about', 'contact', 'privacy', 'terms', 'features', 'pricing', 'docs'].includes(activeTab);

  if (!token) {
    switch (activeTab) {
      case 'login': return <LoginForm />;
      case 'about': return <PublicLayout onNavigate={setActiveTab}><AboutPage onNavigate={setActiveTab} /></PublicLayout>;
      case 'contact': return <PublicLayout onNavigate={setActiveTab}><ContactPage /></PublicLayout>;
      case 'privacy': return <PublicLayout onNavigate={setActiveTab}><PrivacyPage /></PublicLayout>;
      case 'terms': return <PublicLayout onNavigate={setActiveTab}><TermsPage /></PublicLayout>;
      case 'features': return <PublicLayout onNavigate={setActiveTab}><FeaturesPage /></PublicLayout>;
      case 'pricing': return <PublicLayout onNavigate={setActiveTab}><PricingPage /></PublicLayout>;
      case 'docs': return <PublicLayout onNavigate={setActiveTab}><DocsPage /></PublicLayout>;
      case 'landing':
      default:
        return <PublicLayout onNavigate={setActiveTab}><LandingPage onNavigate={setActiveTab} /></PublicLayout>;
    }
  }

  if (isPublicPage) {
    switch (activeTab) {
      case 'about': return <PublicLayout onNavigate={setActiveTab}><AboutPage onNavigate={setActiveTab} /></PublicLayout>;
      case 'contact': return <PublicLayout onNavigate={setActiveTab}><ContactPage /></PublicLayout>;
      case 'privacy': return <PublicLayout onNavigate={setActiveTab}><PrivacyPage /></PublicLayout>;
      case 'terms': return <PublicLayout onNavigate={setActiveTab}><TermsPage /></PublicLayout>;
      case 'features': return <PublicLayout onNavigate={setActiveTab}><FeaturesPage /></PublicLayout>;
      case 'pricing': return <PublicLayout onNavigate={setActiveTab}><PricingPage /></PublicLayout>;
      case 'docs': return <PublicLayout onNavigate={setActiveTab}><DocsPage /></PublicLayout>;
      case 'landing':
      default:
        return <PublicLayout onNavigate={setActiveTab}><LandingPage onNavigate={setActiveTab} /></PublicLayout>;
    }
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'groups': return <GroupsPage />;
      case 'dm':     return <DirectMessages />;
      case 'settings': return <SettingsPage />;
      default:     return <GroupsPage />;
    }
  };

  const navItems = [
    { id: 'groups',   icon: 'groups',   label: 'Groups', prefix: '' },
    { id: 'dm',       icon: 'mail',     label: 'Direct Messages', prefix: '' },
    { id: 'settings', icon: 'settings', label: 'Settings', prefix: '' },
  ];

  const isChatting = activeRoomId !== null && activeRoomId !== 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' && activeRoomId !== '';

  return (
    <div style={S.layout}>
      {/* Global cursor glow */}
      <div style={S.pointerGlow} />

      {/* Sidebar */}
      <aside style={{
        ...S.sidebar,
        display: isChatting ? 'none' : 'flex'
      }}>
        {/* Brand Header */}
        <div style={S.brandHeader}>
          <div style={S.logoBox}>
            <span style={{ ...S.materialIcon, fontVariationSettings: "'FILL' 1" }}>diamond</span>
          </div>
          <span style={S.brandName}>Ekam</span>
          {/* Connection dot */}
          <div style={{
            marginLeft: 'auto',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isConnected ? '#adc6ff' : '#424754',
            boxShadow: isConnected ? '0 0 8px rgba(173,198,255,0.6)' : 'none',
          }} title={connectionStatus} />
        </div>

        {/* Nav */}
        <nav style={S.nav}>
          <p style={S.navLabel}>Channels</p>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  ...S.navBtn,
                  ...(isActive ? S.navBtnActive : S.navBtnInactive),
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = '#e2e2e2';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(194,198,214,0.6)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                <span style={S.materialIcon}>{item.icon}</span>
                <span>{item.prefix}{item.label}</span>
                {isActive && isConnected && (
                  <span style={{
                    ...S.activeDot,
                    background: '#adc6ff',
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={S.userFooter}>
          <div style={S.userCard}>
            <div style={S.userAvatar}>
              <span style={{ ...S.materialIcon, color: '#adc6ff', fontSize: 14 }}>person</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e2e2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>You</p>
              <p style={{ fontSize: 10, color: 'rgba(194,198,214,0.4)' }}>{connectionStatus}</p>
            </div>
            <button
              onClick={() => clearAuth()}
              style={S.logoutBtn}
              title="Sign out"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#adc6ff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(194,198,214,0.3)'; }}
            >
              <span style={{ ...S.materialIcon, fontSize: 16 }}>logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={S.mainContent}>
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;
