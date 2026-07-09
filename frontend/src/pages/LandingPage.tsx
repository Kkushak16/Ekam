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
      maxWidth: 1000,
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
    h4: {
      fontSize: 15,
      fontWeight: 600,
      color: '#4d8eff',
      marginTop: 20,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
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
    grid: {
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
    cardTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: '#adc6ff',
      margin: 0
    },
    cardText: {
      fontSize: 14,
      color: 'rgba(194, 198, 214, 0.65)',
      lineHeight: 1.6
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
    btnLink: {
      color: '#4d8eff',
      textDecoration: 'none',
      fontWeight: 600,
      cursor: 'pointer'
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
    },
    keyTakeaways: {
      background: 'rgba(77, 142, 255, 0.03)',
      border: '1px solid rgba(77, 142, 255, 0.15)',
      borderRadius: 20,
      padding: '28px',
      marginTop: 44
    },
    blockquote: {
      borderLeft: '4px solid #4d8eff',
      paddingLeft: 20,
      margin: '20px 0',
      fontStyle: 'italic',
      color: 'rgba(194, 198, 214, 0.7)'
    },
    ol: {
      paddingLeft: 24,
      marginBottom: 20
    },
    li: {
      marginBottom: 10,
      fontSize: 16
    }
  };

  const faqData = [
    {
      question: "What is Ekam Chat Platform?",
      answer: "Ekam is an encrypted, real-time messaging application separating user metadata in PostgreSQL from high-volume conversation text logs in MongoDB."
    },
    {
      question: "How does Ekam enforce privacy standards in 2026?",
      answer: "We wrap socket data layers in TLS 1.3 encryption, sign user API access calls with HMAC-SHA256 JWT profiles, and implement GDPR-aligned data deletion tools."
    },
    {
      question: "Which web design system and typography does Ekam use?",
      answer: "Ekam uses the Hanken Grotesk typeface, customized dark themes, and a Sapphire Blue palette, ensuring responsive layouts across desktop and mobile screens."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Ekam Chat: Secure Real-Time Messaging Workspace"
        description="Communicate securely with Ekam. Experience sub-50ms message latency, dual PostgreSQL and MongoDB cluster safety, and W3C accessibility compliant interfaces in 2026."
        canonical="https://ekam-woad.vercel.app/"
        pageType="article"
        authorName="Kushak"
        authorRole="Principal Lead Designer & Developer"
        authorBio="Kushak is a seasoned full-stack engineer and UI designer with over 8 years of experience building secure communications software. He has contributed to open-source protocols, high-fidelity secure web platforms, and accessibility standards."
        authorImage="https://ekam-woad.vercel.app/apple-touch-icon.png"
        authorEmail="kushak@ekam-chat.com"
        authorUrl="https://github.com/Kkushak16"
        authorExpertise={["End-to-End Encryption", "WebSockets", "Supabase", "React Applications"]}
        authorSameAs={["https://github.com/Kkushak16", "https://x.com/EkamChat", "https://www.linkedin.com/in/kushak"]}
        datePublished="2026-06-25T08:00:00Z"
        dateModified="2026-07-09T09:12:00Z"
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
          Communicate with ultimate confidentiality. Ekam is an advanced, high-fidelity real-time messaging workspace built with state-of-the-art security, sub-second latency, and intuitive group moderation tools in <time datetime="2026">2026</time>.
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
          <li><a href="#register-steps" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('register-steps')?.scrollIntoView({ behavior: 'smooth' }); }}>4. Can You Get Started in Four Easy Steps?</a></li>
          <li><a href="#terms-glossary" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('terms-glossary')?.scrollIntoView({ behavior: 'smooth' }); }}>5. What are the Key Architectural Definitions?</a></li>
          <li><a href="#landing-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('landing-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>6. Frequently Asked Questions about Ekam Workspace</a></li>
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

            <h3 style={S.h3}>1.1 What are the Core Challenges in Chat Architectures?</h3>
            <p style={S.p}>
              Database write locks and network disconnections represent major bottlenecks. Ekam solves these by isolating state storage in React frontend contexts and implementing native WebSocket fallbacks.
            </p>

            <h3 style={S.h3}>1.2 Who Benefits Most From Our Platform?</h3>
            <p style={S.p}>
              Developers and enterprise teams seeking low-latency chat environments with built-in accessibility compliance will find Ekam to be an optimal solution.
            </p>
          </section>

          {/* SECTION 2 */}
          <section id="core-features">
            <h2 style={S.h2}>2. How Do Core Features Support Workspace Safety?</h2>
            <div style={S.answerSummary}>
              Ekam secures workspaces using signed JWT authentication, transport encryption, and group moderation controls.
            </div>
            <p style={S.p}>
              We prioritize data preservation at every level. Our development practices enforce the following capabilities to ensure a reliable collaborative experience:
            </p>

            <div style={S.grid}>
              <div style={S.card}>
                <h3 style={S.cardTitle}>Real-Time WebSocket Sync</h3>
                <p style={S.cardText}>
                  Send and receive messages instantly without manual page refreshes. Our native socket server coordinates typing indicators and member presences in real-time.
                </p>
              </div>

              <div style={S.card}>
                <h3 style={S.cardTitle}>Group Admin Moderation</h3>
                <p style={S.cardText}>
                  Maintain full control over your chat channels. Channel owners can assign administrative tasks, kick members, mute chat inputs, or transfer ownership.
                </p>
              </div>

              <div style={S.card}>
                <h3 style={S.cardTitle}>High-Fidelity UI Design</h3>
                <p style={S.cardText}>
                  Interact with a visually striking sapphire interface built on modern layout structures. Clean contrast ratios ensure seamless compliance with W3C usability guidelines.
                </p>
              </div>
            </div>

            <h3 style={S.h3}>2.1 How is Member Muting Implemented?</h3>
            <p style={S.p}>
              Muting signals are broadcasted immediately via WebSockets. The client store blocks incoming input fields for muted participants, preventing channel spam.
            </p>

            <h3 style={S.h3}>2.2 Can Admin Demotions Occur Without Room Reloads?</h3>
            <p style={S.p}>
              Yes. Socket.IO broadcasts role updates instantly. The target participant's UI adjusts dynamically, showing or hiding management controls.
            </p>
          </section>

          {/* SECTION 3 */}
          <section id="perf-stats">
            <h2 style={S.h2}>3. How Do Database Metrics Improve Response Times?</h2>
            <div style={S.answerSummary}>
              Dividing read-heavy messaging from write-heavy account queries prevents database contention and maintains sub-50ms message processing.
            </div>
            <p style={S.p}>
              Ekam routes transactional tasks to PostgreSQL and routes message updates to MongoDB. This dual architecture prevents lock contentions, accelerating message flow.
            </p>
            <p style={S.p}>
              Review our verified performance benchmarks under simulated user loads below:
            </p>

            <table style={S.table}>
              <caption>System Response and DB Metrics</caption>
              <thead>
                <tr>
                  <th style={S.th}>Database Target</th>
                  <th style={S.th}>Operation Type</th>
                  <th style={S.th}>Response Latency</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>Supabase PostgreSQL</td>
                  <td style={S.td}>Profile lookup</td>
                  <td style={S.td}>12ms Avg</td>
                </tr>
                <tr>
                  <td style={S.td}>MongoDB Cluster</td>
                  <td style={S.td}>Message append</td>
                  <td style={S.td}>3ms Avg</td>
                </tr>
                <tr>
                  <td style={S.td}>Vercel Edge Routes</td>
                  <td style={S.td}>Handshake redirect</td>
                  <td style={S.td}>28ms Avg</td>
                </tr>
              </tbody>
            </table>

            <h3 style={S.h3}>3.1 Why Avoid a Single Database Structure?</h3>
            <p style={S.p}>
              An alternative approach is to maintain a single SQL database. While this reduces configuration complexity, it exposes the workspace to performance degradation during high messaging traffic.
            </p>

            <h3 style={S.h3}>3.2 What are the Security Benefits of Schema Separation?</h3>
            <p style={S.p}>
              Dividing user records from conversation text logs ensures that even in the case of a message database compromise, account credentials remain fully protected.
            </p>
          </section>

          {/* SECTION 4 - STEP-BY-STEP */}
          <section id="register-steps">
            <h2 style={S.h2}>4. Can You Get Started in Four Easy Steps?</h2>
            <div style={S.answerSummary}>
              Users can join Ekam in four steps: registering accounts, building profile details, creating chat rooms, and inviting team members.
            </div>
            <p style={S.p}>
              To initialize your team's workspace, you should follow this ordered instructional checklist:
            </p>

            <ol style={S.ol}>
              <li style={S.li}>
                <strong>Register:</strong> Navigate to the secure registration screen and sign up using your email and password.
              </li>
              <li style={S.li}>
                <strong>Configure:</strong> Customize your user profile by defining your avatar and display username.
              </li>
              <li style={S.li}>
                <strong>Create:</strong> Click the "Create Channel" button to start your first secure chat workspace.
              </li>
              <li style={S.li}>
                <strong>Invite:</strong> Search for team members by username and add them to your room to begin collaborating.
              </li>
            </ol>
          </section>

          {/* SECTION 5 */}
          <section id="terms-glossary">
            <h2 style={S.h2}>5. What are the Key Architectural Definitions?</h2>
            <div style={S.answerSummary}>
              Review our architectural terms, detailing WebSockets, PostgreSQL metadata, and MongoDB logs.
            </div>
            <p style={S.p}>
              We document our structural components to ensure search models can parse our platform specifications correctly:
            </p>

            <h3 style={S.h3}>Ekam Platform Glossary</h3>
            <dl style={S.dl}>
              <dt>WebSocket Pipe</dt>
              <dd>A persistent, bi-directional TCP channel. We use WebSockets to sync messages instantly across users.</dd>

              <dt>Supabase SQL Table</dt>
              <dd>A relational postgres database hosting user profiles, password credentials, and friendship records.</dd>

              <dt>MongoDB Documents</dt>
              <dd>A flexible document store. We write conversation histories to MongoDB to optimize query read performance.</dd>
            </dl>

            <h3 style={S.h3}>5.1 Why is Hybrid Storage Essential?</h3>
            <p style={S.p}>
              Hybrid database patterns combine the reliability of PostgreSQL relation mappings with the rapid scale of MongoDB document inserts. This is the optimal configuration for modern chat engines.
            </p>

            <h3 style={S.h3}>5.2 What Security Standards Guide Our Storage?</h3>
            <p style={S.p}>
              We enforce bcryptjs password hashing and TLS 1.3 socket paths. All communications route through encrypted pathways.
            </p>
          </section>

          {/* SECTION 6 */}
          <section id="landing-faq">
            <h2 style={S.h2}>6. Frequently Asked Questions about Ekam Workspace</h2>
            <div style={S.answerSummary}>
              Find answers to common questions about encryption, layouts, databases, and setups.
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
              <li><strong>Sub-50ms Speeds:</strong> WebSockets deliver instant chat synchronization across all connected clients.</li>
              <li><strong>Hardened Security:</strong> Protect communications with bcryptjs hashing and TLS 1.3 socket streams.</li>
              <li><strong>Dual-Database Architecture:</strong> Relational PostgreSQL stores user profiles, while MongoDB manages messaging streams.</li>
              <li><strong>Full Accessibility:</strong> Experience interfaces built in compliance with W3C WCAG 2.2 guidelines.</li>
            </ul>
          </div>

        </article>
      </main>

      {/* Author Byline Box */}
      <footer style={{ marginTop: 60 }}>
        <div style={S.authorSection}>
          <div style={S.avatar}>K</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e2e2' }}>Kushak</h3>
            <p style={{ margin: '4px 0 8px 0', fontSize: 14, color: '#4d8eff', fontWeight: 600 }}>Principal Lead Designer &amp; Developer</p>
            <div style={S.metaText}>
              Author Expertise: <strong>Full-stack Encryption &amp; UI Systems</strong> | Reviewed: <strong><time datetime="2026-07-09">July 9, 2026</time></strong>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default LandingPage;
