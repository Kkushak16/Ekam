import React, { useState } from 'react';
import SEOMeta from '../components/SEOMeta';

export function FeaturesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const S: Record<string, React.CSSProperties> = {
    container: {
      maxWidth: 1000,
      margin: '0 auto',
      padding: '60px 24px',
      lineHeight: 1.8,
      color: 'rgba(194, 198, 214, 0.8)'
    },
    h1: {
      fontSize: 'clamp(28px, 5vw, 48px)',
      fontWeight: 800,
      color: '#e2e2e2',
      marginBottom: 16,
      letterSpacing: '-0.03em',
      lineHeight: 1.2
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
    intro: {
      fontSize: 18,
      lineHeight: 1.7,
      color: '#e2e2e2',
      marginBottom: 32,
      fontWeight: 400
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
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 24,
      margin: '32px 0'
    },
    card: {
      background: 'rgba(77, 142, 255, 0.03)',
      border: '1px solid rgba(77, 142, 255, 0.1)',
      borderRadius: 20,
      padding: 28
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
      question: "How does Ekam manage client-side state mapping?",
      answer: "Ekam uses Zustand stores integrated with local storage persisters. This allows authentication tokens, theme configurations, and friend requests to persist during browser updates, eliminating blank login displays."
    },
    {
      question: "Why does Ekam support multi-protocol fallbacks?",
      answer: "Web environments vary wildly. Corporate proxies and legacy router equipment frequently block persistent TCP/WebSocket lines. By utilizing SSE and HTTP long-polling fallbacks, Ekam guarantees 100% connectivity coverage."
    },
    {
      question: "What makes Ekam's group moderation system secure?",
      answer: "All moderation requests are verified at the API routing layer in the backend. Commands such as promoting admins, kicking members, or muting users must match signature tokens stored in the secure database layer."
    },
    {
      question: "Does Ekam support dark and light mode UI designs?",
      answer: "Ekam is optimized for a premium dark mode layout utilizing Hanken Grotesk fonts and Sapphire Blue primary elements. This design has been tested to meet strict readability benchmarks and reduce eye strain."
    },
    {
      question: "Can you customize notifications on the Ekam platform?",
      answer: "Yes. Ekam supports granular control over alerts. Users can configure sound indicators, set desktop banner notifications via standard Web APIs, or mute active group rooms directly from the sidebar UI."
    },
    {
      question: "How are file attachment previews styled in chat windows?",
      answer: "File attachments are rendered using specialized card templates. Images, PDF documents, and text files show descriptive icons, sizes, and instant download triggers, rather than plain text URL links."
    },
    {
      question: "What is the average response time for message delivery?",
      answer: "Message transmission averages under 50ms on active WebSocket lines. In backup SSE mode, updates synchronize within 100-200ms depending on client polling cycles and connection strength."
    },
    {
      question: "How does the search directory locate active users?",
      answer: "Users can find teammates via the built-in search input in the header. The application queries indexed user entries in PostgreSQL, providing autocomplete results instantly as you type."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Ekam Features: Advanced Real-Time Messaging Tools"
        description="Explore the technical features of Ekam Chat Platform, detailing our hybrid WebSocket and SSE connection protocols, secure user directories, and group admin toolsets in 2026."
        canonical="https://ekam-woad.vercel.app/features"
        pageType="product"
        price="0.00"
        priceCurrency="USD"
        breadcrumbs={[
          { name: "Home", item: "https://ekam-woad.vercel.app/" },
          { name: "Features", item: "https://ekam-woad.vercel.app/features" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>Ekam Features: Advanced Real-Time Messaging Tools</h1>
        <p style={S.intro}>
          Ekam is engineered to deliver reliable real-time messaging, robust group management, and secure account isolation. Learn how our technology stack maintains instant communications for high-density modern workspaces.
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#realtime-pipeline" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('realtime-pipeline')?.scrollIntoView({ behavior: 'smooth' }); }}>1. How Does the Real-Time Fallback Pipeline Work?</a></li>
          <li><a href="#group-moderation" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('group-moderation')?.scrollIntoView({ behavior: 'smooth' }); }}>2. Why Choose Our Admin and Moderation Framework?</a></li>
          <li><a href="#secure-architecture" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('secure-architecture')?.scrollIntoView({ behavior: 'smooth' }); }}>3. What is Our Security and Profile Authentication Standard?</a></li>
          <li><a href="#technical-specifications" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('technical-specifications')?.scrollIntoView({ behavior: 'smooth' }); }}>4. What are Ekam's Technical Architecture Specifications?</a></li>
          <li><a href="#features-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('features-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>5. Frequently Asked Questions about Ekam Features</a></li>
        </ul>
      </nav>

      <main id="main-content">
        <article>

          {/* SECTION 1 */}
          <section id="realtime-pipeline">
            <h2 style={S.h2}>1. How Does the Real-Time Fallback Pipeline Work?</h2>
            <div style={S.answerSummary}>
              Ekam maintains persistent connections by automatically switching between WebSocket streams and Server-Sent Events (SSE) depending on client network conditions.
            </div>
            <p style={S.p}>
              Real-time workspace updates require resilient data pathways. If a client network drops, or if enterprise proxies filter out persistent TCP connections, the application switches automatically to HTTP Server-Sent Events (SSE) or long-polling. This fallback is designed in compliance with the <a href="https://html.spec.whatwg.org/multipage/server-sent-events.html" target="_blank" rel="noopener noreferrer" style={S.btnLink}>WHATWG Server-Sent Events specification</a>, preserving active states and message queues.
            </p>
            <p style={S.p}>
              The connection state is monitored continuously by our frontend stores. When WebSockets fail, the store switches routes instantly, requesting updates from the REST backend without disrupting the active viewport.
            </p>
          </section>

          {/* SECTION 2 */}
          <section id="group-moderation">
            <h2 style={S.h2}>2. Why Choose Our Admin and Moderation Framework?</h2>
            <div style={S.answerSummary}>
              Ekam enables secure group collaboration by offering fine-grained admin roles, instant member kicking, muting toggles, and total ownership transfers.
            </div>
            <p style={S.p}>
              Workspace management requires powerful controls. Channel creators can assign admin privileges, manage chat settings, and kick members who disrupt the channel. All actions are dispatched immediately via Socket.IO, updating the UI for all connected participants in real-time.
            </p>
            <p style={S.p}>
              Additionally, group moderators can mute users to keep large channels focused, or transfer ownership before leaving a channel. This maintains organizational continuity without requiring administrator support.
            </p>
          </section>

          {/* SECTION 3 */}
          <section id="secure-architecture">
            <h2 style={S.h2}>3. What is Our Security and Profile Authentication Standard?</h2>
            <div style={S.answerSummary}>
              Ekam isolates user profiles by combining Supabase PostgreSQL authentication with secure JSON Web Token verification on MongoDB cluster routes.
            </div>
            <p style={S.p}>
              We prioritize data privacy. Registration uses Supabase, which generates secure credentials tokens. These tokens authorize REST requests and WebSocket handshakes, ensuring user messages are only accessible to verified accounts.
            </p>
            <p style={S.p}>
              Furthermore, all backend systems run behind secure Vercel routers configured with strict security headers, shielding client connections from Cross-Site Scripting (XSS) and frame injection vulnerabilities.
            </p>
          </section>

          {/* SECTION 4 */}
          <section id="technical-specifications">
            <h2 style={S.h2}>4. What are Ekam's Technical Architecture Specifications?</h2>
            <div style={S.answerSummary}>
              Ekam is built on a modern, high-performance stack composed of React, Node.js, Socket.IO, PostgreSQL, and MongoDB.
            </div>
            <p style={S.p}>
              Our engineering stack relies on proven open standards. Check our architectural properties below:
            </p>

            <table style={S.table}>
              <caption>Platform Component Specifications in 2026</caption>
              <thead>
                <tr>
                  <th style={S.th}>Architecture Component</th>
                  <th style={S.th}>Selected Standard / Technology</th>
                  <th style={S.th}>Primary Operational Role</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>Frontend Library</td>
                  <td style={S.td}>React 18 &amp; TypeScript</td>
                  <td style={S.td}>Interactive Client Layout &amp; Rendering</td>
                </tr>
                <tr>
                  <td style={S.td}>State Manager</td>
                  <td style={S.td}>Zustand (Persist Middleware)</td>
                  <td style={S.td}>Persistent Auth and Session Caching</td>
                </tr>
                <tr>
                  <td style={S.td}>Primary Database</td>
                  <td style={S.td}>PostgreSQL (Supabase)</td>
                  <td style={S.td}>Relational Users &amp; Channel Metadata</td>
                </tr>
                <tr>
                  <td style={S.td}>Message Database</td>
                  <td style={S.td}>MongoDB Cluster</td>
                  <td style={S.td}>High-Throughput Chat Message Storage</td>
                </tr>
                <tr>
                  <td style={S.td}>Real-time Engine</td>
                  <td style={S.td}>Socket.IO (WebSockets)</td>
                  <td style={S.td}>Bidirectional Instant Event Relays</td>
                </tr>
              </tbody>
            </table>

            <p style={S.p}>
              This technology stack ensures that developers can set up Ekam locally using standard Node.js scripts in under five minutes. For step-by-step guidance on setting up the codebase, visit the <a href="/about" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'about' })); }} style={S.btnLink}>Ekam About Us page</a>.
            </p>
          </section>

          {/* SECTION 5 */}
          <section id="features-faq">
            <h2 style={S.h2}>5. Frequently Asked Questions about Ekam Features</h2>
            <div style={S.answerSummary}>
              Browse through our feature FAQ directory to find details about state synchronization, offline access, notifications, and typography styles.
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
              <li><strong>Reliable Streams:</strong> Dual-channel pipelines seamlessly transition between WebSockets and SSE to prevent message loss.</li>
              <li><strong>Advanced Moderation:</strong> Channel admins can mute users, manage rosters, or transfer room ownership.</li>
              <li><strong>Enterprise Protection:</strong> Verified JWT signatures secure database routes and socket interactions.</li>
              <li><strong>Optimized Performance:</strong> Lightweight bundle sizes defer scripts to achieve fast page loads on all devices in 2026.</li>
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
export default FeaturesPage;
