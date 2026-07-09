import React from 'react';
import { useChatStore } from '../store/chatStore';

interface PublicLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
}

export function PublicLayout({ children, onNavigate }: PublicLayoutProps) {
  const token = useChatStore((state) => state.token);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, page: string) => {
    e.preventDefault();
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const S: Record<string, React.CSSProperties> = {
    skipLink: {
      position: 'absolute',
      top: -100,
      left: 10,
      background: '#4d8eff',
      color: '#00285d',
      padding: '8px 16px',
      zIndex: 10000,
      borderRadius: '8px',
      transition: 'top 0.2s ease',
      fontWeight: 'bold',
      textDecoration: 'none'
    },
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(10, 10, 10, 0.75)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '16px 24px'
    },
    headerInner: {
      maxWidth: 1200,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16
    },
    logoBox: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      textDecoration: 'none',
      color: '#e2e2e2'
    },
    diamond: {
      fontFamily: "'Material Symbols Outlined'",
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontSize: 24,
      lineHeight: 1,
      display: 'inline-block',
      color: '#4d8eff',
      fontVariationSettings: "'FILL' 1"
    },
    brandName: {
      fontWeight: 800,
      fontSize: 20,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(135deg, #e2e2e2 0%, #adc6ff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      gap: 24
    },
    navLink: {
      fontSize: 14,
      fontWeight: 600,
      color: 'rgba(194, 198, 214, 0.7)',
      textDecoration: 'none',
      transition: 'color 0.2s ease'
    },
    btnLaunch: {
      background: 'rgba(173, 198, 255, 0.1)',
      color: '#adc6ff',
      border: '1px solid rgba(173, 198, 255, 0.2)',
      borderRadius: '999px',
      padding: '8px 20px',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    },
    footer: {
      background: '#070707',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '48px 24px 24px',
      marginTop: 'auto'
    },
    footerInner: {
      maxWidth: 1200,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 40
    },
    footerCols: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 40,
      justifyContent: 'space-between'
    },
    footerBrand: {
      flex: '1 1 300px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    },
    footerDesc: {
      fontSize: 14,
      color: 'rgba(194, 198, 214, 0.5)',
      lineHeight: 1.6
    },
    footerCol: {
      flex: '1 1 150px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    },
    footerColTitle: {
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: '#e2e2e2'
    },
    footerList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    footerLink: {
      fontSize: 14,
      color: 'rgba(194, 198, 214, 0.5)',
      textDecoration: 'none',
      transition: 'color 0.2s ease'
    },
    footerBottom: {
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      paddingTop: 24,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
      fontSize: 12,
      color: 'rgba(194, 198, 214, 0.4)'
    },
    authorBox: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      textAlign: 'right' as const
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#000000', color: '#e2e2e2', width: '100vw', overflowX: 'hidden' }}>
      {/* Accessibility: Skip Link */}
      <a 
        href="#main-content" 
        style={S.skipLink}
        onFocus={(e) => { e.currentTarget.style.top = '10px'; }}
        onBlur={(e) => { e.currentTarget.style.top = '-100px'; }}
      >
        Skip to main content
      </a>

      {/* Header landmark */}
      <header style={S.header}>
        <div style={S.headerInner}>
          {/* Brand Logo & Name */}
          <a href="/" onClick={(e) => handleNavClick(e, 'landing')} style={S.logoBox} aria-label="Ekam Home Page">
            <span style={S.diamond}>diamond</span>
            <span style={S.brandName}>Ekam</span>
          </a>

          {/* Navigation landmark */}
          <nav style={S.nav} aria-label="Main Navigation">
            <a 
              href="/features" 
              onClick={(e) => handleNavClick(e, 'features')} 
              style={S.navLink}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#4d8eff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(194,198,214,0.7)'; }}
            >
              Features
            </a>
            <a 
              href="/pricing" 
              onClick={(e) => handleNavClick(e, 'pricing')} 
              style={S.navLink}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#4d8eff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(194,198,214,0.7)'; }}
            >
              Pricing
            </a>
            <a 
              href="/about" 
              onClick={(e) => handleNavClick(e, 'about')} 
              style={S.navLink}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#4d8eff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(194,198,214,0.7)'; }}
            >
              About
            </a>
            <a 
              href="/docs" 
              onClick={(e) => handleNavClick(e, 'docs')} 
              style={S.navLink}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#4d8eff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(194,198,214,0.7)'; }}
            >
              Docs
            </a>
            <a 
              href="/contact" 
              onClick={(e) => handleNavClick(e, 'contact')} 
              style={S.navLink}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#4d8eff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(194,198,214,0.7)'; }}
            >
              Contact
            </a>

             {/* Launch App CTA */}
            <a 
              href={token ? "/dm" : "/login"} 
              onClick={(e) => handleNavClick(e, token ? 'dm' : 'login')} 
              style={S.btnLaunch}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(173,198,255,0.2)';
                e.currentTarget.style.borderColor = 'rgba(173,198,255,0.45)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(173,198,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(173,198,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(173,198,255,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {token ? 'Launch App' : 'Sign In'}
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content landmark */}
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer landmark */}
      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div style={S.footerCols}>
            {/* Brand column */}
            <div style={S.footerBrand}>
              <div style={{ ...S.logoBox, cursor: 'default' }}>
                <span style={S.diamond}>diamond</span>
                <span style={S.brandName}>Ekam</span>
              </div>
              <p style={S.footerDesc}>
                The next generation, end-to-end encrypted real-time communications platform. Secure your conversations with crystal-clear audio, dynamic groups, and robust direct messages.
              </p>
            </div>

            {/* Links columns */}
            <div style={S.footerCol}>
              <span style={S.footerColTitle}>Product</span>
              <ul style={S.footerList}>
                <li>
                  <a href="/features" onClick={(e) => handleNavClick(e, 'features')} style={S.footerLink}>Features</a>
                </li>
                <li>
                  <a href="/pricing" onClick={(e) => handleNavClick(e, 'pricing')} style={S.footerLink}>Pricing</a>
                </li>
                <li>
                  <a href="/docs" onClick={(e) => handleNavClick(e, 'docs')} style={S.footerLink}>Docs</a>
                </li>
              </ul>
            </div>

            <div style={S.footerCol}>
              <span style={S.footerColTitle}>Company</span>
              <ul style={S.footerList}>
                <li>
                  <a href="/about" onClick={(e) => handleNavClick(e, 'about')} style={S.footerLink}>About Us</a>
                </li>
                <li>
                  <a href="/contact" onClick={(e) => handleNavClick(e, 'contact')} style={S.footerLink}>Contact Support</a>
                </li>
              </ul>
            </div>

            <div style={S.footerCol}>
              <span style={S.footerColTitle}>Legal</span>
              <ul style={S.footerList}>
                <li>
                  <a href="/privacy" onClick={(e) => handleNavClick(e, 'privacy')} style={S.footerLink}>Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms" onClick={(e) => handleNavClick(e, 'terms')} style={S.footerLink}>Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>

          <div style={S.footerBottom}>
            <div>
              &copy; {new Date().getFullYear()} Ekam Inc. All rights reserved.
            </div>

            {/* Author Information (E-E-A-T Signal Requirement 24) */}
            <div style={S.authorBox}>
              <div>Designed &amp; Developed by <strong>Kushak</strong>, Principal Lead Designer</div>
              <div style={{ fontSize: 10, color: 'rgba(194, 198, 214, 0.3)' }}>Last Updated: July 9, 2026</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default PublicLayout;
