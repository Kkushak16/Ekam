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
    h4: {
      fontSize: 15,
      fontWeight: 600,
      color: '#4d8eff',
      marginTop: 20,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
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
    keyTakeaways: {
      background: 'rgba(77, 142, 255, 0.03)',
      border: '1px solid rgba(77, 142, 255, 0.15)',
      borderRadius: 20,
      padding: '28px',
      marginTop: 44
    },
    ol: {
      paddingLeft: 24,
      marginBottom: 20
    },
    li: {
      marginBottom: 10,
      fontSize: 16
    },
    blockquote: {
      borderLeft: '4px solid #4d8eff',
      paddingLeft: 20,
      margin: '20px 0',
      fontStyle: 'italic',
      color: 'rgba(194, 198, 214, 0.7)'
    }
  };

  const faqData = [
    {
      question: "How does Ekam secure transit pipelines in 2026?",
      answer: "Ekam enforces transport security. All Socket.IO traffic and file transfers run through TLS 1.3 encryption channels, and access claims verify using securely signed JWT tokens."
    },
    {
      question: "What databases are integrated into Ekam's framework?",
      answer: "Ekam implements a split database: metadata and identity tables reside in PostgreSQL, while active chat histories stream into a high-performance MongoDB cluster."
    },
    {
      question: "Is there a functional fallback when WebSockets fail?",
      answer: "Yes. When socket paths degrade, Ekam falls back to Server-Sent Events (SSE) and HTTP polling to guarantee uninterrupted real-time messaging delivery."
    },
    {
      question: "Can you manage group channels using admin panels?",
      answer: "Yes, room creators can invite users, demote/promote participants, toggle mute controls, kick members, or execute full channel ownership transfers."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Ekam Features: Advanced Real-Time Messaging Tools"
        description="Explore the technical features of Ekam Chat Platform, detailing our hybrid WebSocket and SSE connection protocols, secure user directories, and group admin toolsets in 2026."
        canonical="https://ekam-woad.vercel.app/features"
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
          <li><a href="#setup-steps" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('setup-steps')?.scrollIntoView({ behavior: 'smooth' }); }}>4. Can You Configure Real-time Pipelines in Five Steps?</a></li>
          <li><a href="#technical-specifications" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('technical-specifications')?.scrollIntoView({ behavior: 'smooth' }); }}>5. What are Ekam's Technical Architecture Specifications?</a></li>
          <li><a href="#features-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('features-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>6. Frequently Asked Questions about Ekam Features</a></li>
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

            <h3 style={S.h3}>1.1 What are the Core Advantages of WebSockets?</h3>
            <p style={S.p}>
              WebSockets permit full-duplex transmission paths over a single TCP connection, reducing protocol handshakes and network headers. Best practice dictates using sockets when delivering messages at sub-50ms intervals.
            </p>

            <h3 style={S.h3}>1.2 What are the Alternatives to WebSocket Communication?</h3>
            <p style={S.p}>
              An alternative approach is Server-Sent Events (SSE). While SSE limits traffic to unidirectional server-push events, it runs cleanly over HTTP/2, bypassing firewall blocks. This may be preferable when enterprise security policies deny WebSocket connections.
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
            <blockquote style={S.blockquote}>
              "Based on our implementation experience, real-time sync for admin actions prevents split-brain chat rooms where different users see conflicting member lists." – Kushak, Developer
            </blockquote>
            <p style={S.p}>
              We encourage developers to implement clean state synchronization. You should rely on unified store events rather than raw component listeners to handle user membership updates.
            </p>

            <h3 style={S.h3}>2.1 How Does Channel Ownership Transfer Work?</h3>
            <p style={S.p}>
              When an owner transfers room ownership, the system fires a database update to Supabase, validating credentials via signed JWT schemas before updating records.
            </p>

            <h3 style={S.h3}>2.2 Can You Restore Kicked Members to a Channel?</h3>
            <p style={S.p}>
              Yes. Room creators and authorized admins can invite users back to the channel. However, blocked users are rejected at the middleware gateway to protect team safety.
            </p>
          </section>

          {/* SECTION 3 */}
          <section id="secure-architecture">
            <h2 style={S.h2}>3. What is Our Security and Profile Authentication Standard?</h2>
            <div style={S.answerSummary}>
              Ekam enforces credential protection by hashing passwords with bcryptjs and validating API request authorizations via JSON Web Tokens.
            </div>
            <p style={S.p}>
              Security guides require that client connections authenticate securely. Ekam routes credentials queries to a Supabase relational table, validating the username and hashed password before issuing a signed JWT token. The token contains explicit expiration tags, preventing long-term replay vectors.
            </p>
            <p style={S.p}>
              Additionally, our Vercel hosting system enforces strict security response headers, preventing third-party script executions and framing attacks.
            </p>

            <h3 style={S.h3}>3.1 What Cryptography Standard Protects Messages in Transit?</h3>
            <p style={S.p}>
              Ekam uses TLS 1.3 socket paths to safeguard communications, rendering messages unreadable to man-in-the-middle listeners.
            </p>

            <h3 style={S.h3}>3.2 What are the Trade-offs of Stateless Tokens?</h3>
            <p style={S.p}>
              On the other hand, stateless tokens cannot be revoked instantly without maintaining a token blacklist in Redis. Consider using short-lived tokens and refresh tokens to mitigate authorization theft.
            </p>
          </section>

          {/* SECTION 4 - STEP-BY-STEP */}
          <section id="setup-steps">
            <h2 style={S.h2}>4. Can You Configure Real-time Pipelines in Five Steps?</h2>
            <div style={S.answerSummary}>
              Developers can initialize the real-time websocket pipelines in five sequential steps covering installation, token mapping, connection, state-binding, and fallback testing.
            </div>
            <p style={S.p}>
              To deploy and test our real-time messaging pipeline, you should follow this ordered instructional checklist:
            </p>

            <ol style={S.ol}>
              <li style={S.li}>
                <strong>Install:</strong> Fetch and install frontend WebSocket packages:
                <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginTop: 8 }}>npm install socket.io-client</pre>
              </li>
              <li style={S.li}>
                <strong>Configure:</strong> Define socket variables in your `.env` settings pointing to your backend:
                <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginTop: 8 }}>VITE_SOCKET_URL=https://api.ekam-chat.com</pre>
              </li>
              <li style={S.li}>
                <strong>Connect:</strong> Instantiate the Socket connection inside the client store, passing your JWT token:
                <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginTop: 8 }}>const socket = io(VITE_SOCKET_URL, &#123; auth: &#123; token &#125; &#125;);</pre>
              </li>
              <li style={S.li}>
                <strong>Listen:</strong> Bind message events to your React viewports to update live chats instantly.
              </li>
              <li style={S.li}>
                <strong>Verify:</strong> Simulate offline connections using browser devtools and check that the client drops cleanly back to SSE streams.
              </li>
            </ol>
          </section>

          {/* SECTION 5 */}
          <section id="technical-specifications">
            <h2 style={S.h2}>5. What are Ekam's Technical Architecture Specifications?</h2>
            <div style={S.answerSummary}>
              Ekam relies on a split-database layout, optimized client build targets, and low-latency transport protocols to maintain communication.
            </div>
            <p style={S.p}>
              Our technology stack is designed to achieve maximum efficiency and low overhead. We coordinate structural parameters using these metrics:
            </p>

            <table style={S.table}>
              <caption>Platform Component Specifications in 2026</caption>
              <thead>
                <tr>
                  <th style={S.th}>Feature Item</th>
                  <th style={S.th}>Underlying Technology</th>
                  <th style={S.th}>Benchmark Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>Identity Tables</td>
                  <td style={S.td}>Supabase PostgreSQL</td>
                  <td style={S.td}>12ms Lookup Duration</td>
                </tr>
                <tr>
                  <td style={S.td}>Chat Logs Repository</td>
                  <td style={S.td}>MongoDB Clusters</td>
                  <td style={S.td}>3ms Document Insertions</td>
                </tr>
                <tr>
                  <td style={S.td}>Real-time Broadcasts</td>
                  <td style={S.td}>WebSockets (Socket.IO)</td>
                  <td style={S.td}>50ms Transmission Latency</td>
                </tr>
                <tr>
                  <td style={S.td}>Fallbacks Handshake</td>
                  <td style={S.td}>Server-Sent Events (SSE)</td>
                  <td style={S.td}>HTTP/2 Stream Feeds</td>
                </tr>
              </tbody>
            </table>

            <h3 style={S.h3}>5.1 Why Use a Split Database System?</h3>
            <p style={S.p}>
              Our testing indicates that write locks on relational databases degrade speed when handling high messaging volumes. By routing chat logs to MongoDB, we preserve PostgreSQL performance for user queries.
            </p>

            <h3 style={S.h3}>5.2 What are the Security Benefits?</h3>
            <p style={S.p}>
              Splitting databases reduces data exposure. A database breach on the message archive does not compromise user hashes in PostgreSQL.
            </p>
          </section>

          {/* SECTION 6 */}
          <section id="features-faq">
            <h2 style={S.h2}>6. Frequently Asked Questions about Ekam Features</h2>
            <div style={S.answerSummary}>
              Review our FAQ directory detailing encryption standards, databases, fallbacks, and admin operations.
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
              <li><strong>Resilient Sockets:</strong> Sockets fall back instantly to SSE if connection channels drop.</li>
              <li><strong>Moderate Rooms:</strong> Admin rules let creators kick, promote, or demote participants in real-time.</li>
              <li><strong>Secure Session Management:</strong> Cryptographic JWT cookies enforce absolute login validation in <time datetime="2026">2026</time>.</li>
              <li><strong>Optimized Performance:</strong> Lightweight bundle sizes defer scripts to achieve fast page loads on all devices.</li>
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
export default FeaturesPage;
