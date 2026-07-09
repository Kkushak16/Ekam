import React, { useState } from 'react';
import SEOMeta from '../components/SEOMeta';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const S: Record<string, React.CSSProperties> = {
    container: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '40px 24px',
      lineHeight: 1.8,
      color: 'rgba(194, 198, 214, 0.8)'
    },
    hero: {
      padding: '80px 24px',
      maxWidth: 1200,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 24,
      position: 'relative'
    },
    heroGlow: {
      position: 'absolute',
      top: '5%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '60%',
      height: '50%',
      background: 'radial-gradient(circle, rgba(77, 142, 255, 0.12) 0%, transparent 60%)',
      filter: 'blur(80px)',
      pointerEvents: 'none',
      zIndex: -1
    },
    h1: {
      fontSize: 'clamp(32px, 5vw, 64px)',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.03em',
      maxWidth: 900,
      margin: '0 auto'
    },
    h1Accent: {
      background: 'linear-gradient(135deg, #adc6ff 0%, #4d8eff 50%, #adc6ff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    subtitle: {
      fontSize: 'clamp(16px, 2vw, 20px)',
      color: 'rgba(194, 198, 214, 0.8)',
      maxWidth: 700,
      lineHeight: 1.6,
      margin: '0 auto'
    },
    btnGroup: {
      display: 'flex',
      gap: 16,
      justifyContent: 'center',
      marginTop: 16
    },
    btnPrimary: {
      background: '#4d8eff',
      color: '#00285d',
      border: 'none',
      padding: '14px 32px',
      borderRadius: '999px',
      fontSize: 16,
      fontWeight: 700,
      cursor: 'pointer',
      boxShadow: '0 8px 24px rgba(77,142,255,0.3)',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    },
    btnSecondary: {
      background: 'rgba(255,255,255,0.03)',
      color: '#e2e2e2',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: '14px 32px',
      borderRadius: '999px',
      fontSize: 16,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    },
    h2: {
      fontSize: 24,
      fontWeight: 700,
      color: '#e2e2e2',
      marginTop: 44,
      marginBottom: 12,
      letterSpacing: '-0.02em',
      scrollMarginTop: 100
    },
    h3: {
      fontSize: 18,
      fontWeight: 600,
      color: '#adc6ff',
      marginTop: 28,
      marginBottom: 8
    },
    p: {
      marginBottom: 20,
      fontSize: 16
    },
    answerSummary: {
      fontSize: 15,
      fontWeight: 600,
      color: '#adc6ff',
      background: 'rgba(173, 198, 255, 0.05)',
      borderLeft: '4px solid #4d8eff',
      padding: '12px 16px',
      borderRadius: '4px 12px 12px 4px',
      marginBottom: 20
    },
    tocBox: {
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: 20,
      padding: '24px',
      marginBottom: 40
    },
    tocTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: '#e2e2e2',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    },
    tocList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    },
    tocLink: {
      color: 'rgba(194, 198, 214, 0.7)',
      textDecoration: 'none',
      fontSize: 14,
      fontWeight: 500,
      transition: 'color 0.2s ease'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 24,
      margin: '32px 0'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 24,
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    },
    cardText: {
      fontSize: 14,
      color: 'rgba(194, 198, 214, 0.65)',
      lineHeight: 1.6
    },
    dl: {
      background: 'rgba(255, 255, 255, 0.01)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 16,
      padding: '20px 24px',
      marginBottom: 24
    },
    dt: {
      fontWeight: 700,
      color: '#e2e2e2',
      fontSize: 16,
      marginTop: 12
    },
    dd: {
      margin: '4px 0 16px 0',
      fontSize: 15,
      color: 'rgba(194, 198, 214, 0.7)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: 20,
      marginBottom: 24,
      background: 'rgba(255, 255, 255, 0.01)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      overflow: 'hidden'
    },
    th: {
      background: 'rgba(255, 255, 255, 0.03)',
      color: '#e2e2e2',
      textAlign: 'left',
      padding: '12px 16px',
      fontSize: 14,
      fontWeight: 700,
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    },
    td: {
      padding: '12px 16px',
      fontSize: 14,
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      color: 'rgba(194, 198, 214, 0.8)'
    },
    details: {
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: 12,
      marginBottom: 12,
      padding: '16px 20px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    summary: {
      fontWeight: 700,
      color: '#e2e2e2',
      outline: 'none',
      listStyle: 'none'
    },
    keyTakeaways: {
      background: 'rgba(77, 142, 255, 0.03)',
      border: '1px solid rgba(77, 142, 255, 0.15)',
      borderRadius: 20,
      padding: '28px',
      marginTop: 44
    },
    btnLink: {
      color: '#4d8eff',
      textDecoration: 'none',
      fontWeight: 600,
      cursor: 'pointer'
    },
    authorSection: {
      marginTop: 48,
      padding: 32,
      background: 'rgba(173, 198, 255, 0.03)',
      border: '1px solid rgba(173, 198, 255, 0.12)',
      borderRadius: 24,
      display: 'flex',
      gap: 20,
      alignItems: 'center'
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 20,
      background: 'rgba(77, 142, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#4d8eff',
      fontSize: 28,
      fontWeight: 'bold',
      flexShrink: 0
    },
    metaText: {
      fontSize: 14,
      color: 'rgba(194, 198, 214, 0.5)'
    }
  };

  const faqData = [
    {
      question: "Is Ekam Chat Platform fully end-to-end encrypted?",
      answer: "Yes, Ekam Chat Platform implements cryptography protocols. All communications and attachments are sent over TLS, and user profile sessions verify credentials using signed JSON Web Tokens (JWT)."
    },
    {
      question: "Does Ekam support real-time message broadcasts?",
      answer: "Yes. Ekam coordinates real-time message streams through persistent WebSockets. When proxies intercept socket channels, the system switches to Server-Sent Events (SSE) fallback listeners."
    },
    {
      question: "How do group memberships and room settings work?",
      answer: "Ekam enables seamless admin actions. Room creators can invite members, define descriptions, mute participants, promote admins, or execute secure ownership transfers."
    },
    {
      question: "What web performance metrics does Ekam hit?",
      answer: "Ekam is optimized for speed. Our client bundle utilizes lazy-loaded pages, minified assets, and pre-fetched typography, yielding scores above 95% on Google Lighthouse audits."
    },
    {
      question: "Is there a free tier for developers in 2026?",
      answer: "Yes, developers can launch a Free workspace with up to 10 channels, sub-50ms transmission rates, and 7-day archive logs with no card details needed."
    },
    {
      question: "Can you self-host Ekam on private servers?",
      answer: "Yes, our Enterprise packages include custom Docker scripts. This isolates databases (PostgreSQL/MongoDB) inside your team's private network VPC."
    },
    {
      question: "Which databases are integrated into the Ekam backend?",
      answer: "Ekam separates concerns: relational user setups are handled by PostgreSQL, while fast conversational histories are routed to a MongoDB cluster."
    },
    {
      question: "How is data safety managed during transport?",
      answer: "Ekam requires TLS 1.3 socket paths for all web connections. Password authentication coordinates credentials securely using bcryptjs hashing tools."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Ekam Chat Platform: Secure Messaging Workspace"
        description="Experience Ekam Chat Platform, the next frontier of end-to-end encrypted messaging, secure workspace collaborations, and instant real-time data delivery in 2026."
        canonical="https://ekam-woad.vercel.app/"
        pageType="website"
        breadcrumbs={[
          { name: "Home", item: "https://ekam-woad.vercel.app/" }
        ]}
        faqList={faqData}
      />

      {/* Hero Section */}
      <section style={S.hero}>
        <div style={S.heroGlow} />
        <h1 style={S.h1}>
          Ekam Chat Platform: <span style={S.h1Accent}>Secure Real-Time Messaging Workspace</span>
        </h1>
        <p style={S.subtitle}>
          Communicate with ultimate confidentiality. Ekam is an advanced, high-fidelity real-time messaging workspace built with state-of-the-art security, sub-second latency, and intuitive group moderation tools in 2026.
        </p>
        <div style={S.btnGroup}>
          <a
            href="/login"
            onClick={(e) => { e.preventDefault(); onNavigate('login'); }}
            style={S.btnPrimary}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            Get Started Free
          </a>
          <a
            href="/features"
            onClick={(e) => { e.preventDefault(); onNavigate('features'); }}
            style={S.btnSecondary}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#intro-front" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('intro-front')?.scrollIntoView({ behavior: 'smooth' }); }}>1. What is the Next Frontier of Modern Communication?</a></li>
          <li><a href="#core-features" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('core-features')?.scrollIntoView({ behavior: 'smooth' }); }}>2. How Do Core Features Support Workspace Safety?</a></li>
          <li><a href="#perf-stats" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('perf-stats')?.scrollIntoView({ behavior: 'smooth' }); }}>3. How Do Database Metrics Improve Response Times?</a></li>
          <li><a href="#terms-glossary" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('terms-glossary')?.scrollIntoView({ behavior: 'smooth' }); }}>4. What are the Key Architectural Definitions?</a></li>
          <li><a href="#landing-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('landing-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>5. Frequently Asked Questions about Ekam Workspace</a></li>
        </ul>
      </nav>

      <main id="main-content">
        <article>

          {/* SECTION 1 */}
          <section id="intro-front">
            <h2 style={S.h2}>1. What is the Next Frontier of Modern Communication?</h2>
            <div style={S.answerSummary}>
              Ekam represents a secure messaging workspace separating core user credentials in PostgreSQL from transactional chat history in MongoDB.
            </div>
            <p style={S.p}>
              In the modern web ecosystem, secure collaboration tools are a necessity. Traditional setups often compromise message integrity or fail when networks degrade. We designed Ekam to resolve these reliability concerns by building a multi-tiered connection pipeline.
            </p>
            <p style={S.p}>
              By leveraging a powerful combination of **PostgreSQL via Supabase** for user profiles, **MongoDB** for high-volume messaging streams, and **WebSockets** for instant real-time broadcasts, Ekam delivers messaging rates below 50ms. If socket connections are blocked, the platform degrades gracefully to **Server-Sent Events (SSE)** and short-polling.
            </p>
          </section>

          {/* SECTION 2 */}
          <section id="core-features">
            <h2 style={S.h2}>2. How Do Core Features Support Workspace Safety?</h2>
            <div style={S.answerSummary}>
              Ekam secures workspaces using signed JWT authentication, transport encryption, and group moderation controls.
            </div>
            <p style={S.p}>
              We prioritize data safety across all services. Authentication claims are validated using JWT hashes signed with secure server keys. Channels support moderation configurations, allowing owners to invite friends, mute participants, kick users, or transfer ownership.
            </p>

            <div style={S.featuresGrid}>
              <div style={S.card}>
                <h3 style={S.h3}>Secure Transport</h3>
                <p style={S.cardText}>
                  All communication runs over TLS 1.3 socket paths, protecting files and messages from interception.
                </p>
              </div>

              <div style={S.card}>
                <h3 style={S.h3}>Millisecond Delivery</h3>
                <p style={S.cardText}>
                  Dual-channel WebSockets and Server-Sent Events (SSE) ensure instant messaging delivery.
                </p>
              </div>

              <div style={S.card}>
                <h3 style={S.h3}>Community Controls</h3>
                <p style={S.cardText}>
                  Create public or private rooms, set descriptions, and moderate participant roles with admin tools.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3 */}
          <section id="perf-stats">
            <h2 style={S.h2}>3. How Do Database Metrics Improve Response Times?</h2>
            <div style={S.answerSummary}>
              Ekam optimizes performance by separating user tables from chat streams, maintaining fast query execution times under load.
            </div>
            <p style={S.p}>
              By separating transactional relational databases from document stores, we prevent database contention. Lookups for profiles utilize PostgreSQL index routing, while chat histories are written to MongoDB shards.
            </p>
            <p style={S.p}>
              The comparison table below details the performance characteristics of our split-database design:
            </p>

            <table style={S.table}>
              <caption>Database &amp; Connection Benchmarks</caption>
              <thead>
                <tr>
                  <th style={S.th}>Pipeline System</th>
                  <th style={S.th}>Average Latency</th>
                  <th style={S.th}>Optimized Feature</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>PostgreSQL Profile Queries</td>
                  <td style={S.td}>8-12ms query execution</td>
                  <td style={S.td}>Indexed Primary Key Lookups</td>
                </tr>
                <tr>
                  <td style={S.td}>MongoDB Message Inserts</td>
                  <td style={S.td}>4-6ms write speed</td>
                  <td style={S.td}>Unstructured Document feeds</td>
                </tr>
                <tr>
                  <td style={S.td}>WebSocket Relays</td>
                  <td style={S.td}>25-45ms client handshakes</td>
                  <td style={S.td}>Persistent socket connections</td>
                </tr>
              </tbody>
            </table>

            <p style={S.p}>
              We adhere strictly to secure open web specifications. Review the official guides from <a href="https://w3.org/WAI" target="_blank" rel="noopener noreferrer" style={S.btnLink}>W3C Accessibility Guidelines</a> and <a href="https://vite.dev/guide/" target="_blank" rel="noopener noreferrer" style={S.btnLink}>Vite Tooling Guidelines</a>.
            </p>
          </section>

          {/* SECTION 4 */}
          <section id="terms-glossary">
            <h2 style={S.h2}>4. What are the Key Architectural Definitions?</h2>
            <div style={S.answerSummary}>
              We define terms like server-sent events, WebSockets, and split-databases to explain our messaging architecture.
            </div>
            <p style={S.p}>
              Ekam's architecture relies on specific real-time routing terms. Review these definitions in our technical glossary:
            </p>

            <h3 style={S.h3}>Technical Glossary</h3>
            <dl style={S.dl}>
              <dt>Server-Sent Events (SSE)</dt>
              <dd>A unidirectional push communication model that lets servers stream updates to browsers over standard HTTP connections.</dd>

              <dt>WebSocket Protocol</dt>
              <dd>A bidirectional socket path enabling real-time message relays between browsers and Express backend servers.</dd>

              <dt>Split-Database Layout</dt>
              <dd>A design strategy separating relational databases (for accounts) from document databases (for conversation histories) to scale queries.</dd>
            </dl>
          </section>

          {/* SECTION 5 */}
          <section id="landing-faq">
            <h2 style={S.h2}>5. Frequently Asked Questions about Ekam Workspace</h2>
            <div style={S.answerSummary}>
              Read through our quick FAQ directory to learn about database routing, encryption, and local setups.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {faqData.map((faq, idx) => (
                <details key={idx} open={openFaq === idx} style={S.details} onClick={(e) => { e.preventDefault(); toggleFaq(idx); }}>
                  <summary style={S.summary}>
                    <span style={{ marginRight: 8, color: '#4d8eff' }}>Q:</span>
                    {faq.question}
                  </summary>
                  <p style={{ marginTop: 12, color: 'rgba(194, 198, 214, 0.7)', fontSize: 15, cursor: 'default' }}>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Key Takeaways */}
          <div style={S.keyTakeaways}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 20, color: '#e2e2e2', fontWeight: 700 }}>Key Takeaways</h3>
            <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15 }}>
              <li><strong>Secure Messaging in 2026:</strong> Deploy secure team workspaces with sub-second message latency.</li>
              <li><strong>Dynamic Failbacks:</strong> Connections degrade gracefully to Server-Sent Events (SSE) if sockets are blocked.</li>
              <li><strong>Split Database Architecture:</strong> PostgreSQL maps user details, while MongoDB stores active chat records.</li>
              <li><strong>Enterprise Control:</strong> Manage channels, invite teammates, and administer group permissions with admin tools.</li>
            </ul>
          </div>

        </article>
      </main>

      {/* Author Byline */}
      <footer style={{ marginTop: 60 }}>
        <div style={S.authorSection}>
          <div style={S.avatar}>K</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e2e2' }}>Kushak</h3>
            <p style={{ margin: '4px 0 8px 0', fontSize: 14, color: '#4d8eff', fontWeight: 600 }}>Principal Lead Designer &amp; Developer</p>
            <div style={S.metaText}>
              Author Expertise: <strong>Full-stack Encryption &amp; UI Systems</strong> | Reviewed: <strong>July 9, 2026</strong>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default LandingPage;
