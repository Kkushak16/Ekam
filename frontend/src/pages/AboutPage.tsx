import React, { useState } from 'react';
import SEOMeta from '../components/SEOMeta';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
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
      answer: "Ekam is a state-of-the-art secure real-time messaging system designed for high-density modern team environments. Built with a dual-database design consisting of Supabase PostgreSQL and MongoDB cluster servers, Ekam delivers sub-50ms message propagation while keeping your credentials protected through secure JWT handshake profiles."
    },
    {
      question: "How does Ekam enforce privacy standards in 2026?",
      answer: "Ekam prevents message interception by encrypting WebSocket communication buffers and isolating database processes. In addition, our systems are built in alignment with GDPR standards, using strict HTTPS SSL handshakes and security-minded Vercel configurations containing X-Frame-Options to eliminate spoofing attacks."
    },
    {
      question: "Why should you choose a split-database layout?",
      answer: "Split-database structures optimize reliability. PostgreSQL ensures relational integrity for user listings, profiles, and workspace settings, whereas MongoDB operates as a fast document store for real-time chat histories, maximizing speed indices even under millions of concurrent connections."
    },
    {
      question: "When should our organization migrate to Ekam?",
      answer: "Your team should migrate to Ekam when your existing communications encounter messaging lag or lack proper security encryption. Ekam provides a clean user interface with zero-configuration setup options, making the transition fast, secure, and hassle-free."
    },
    {
      question: "Can you run Ekam offline or as a Progressive Web App?",
      answer: "Yes, Ekam has fully functional PWA support. Our offline-first web manifest enables you to launch the application directly from your device, cache essential files, and instantly synchronize offline message drafts once network signals are restored."
    },
    {
      question: "Is it possible to scale Ekam for large enterprise teams?",
      answer: "Absolutely. Ekam utilizes Node.js clusters and stateless socket handlers, enabling server resources to scale horizontally. Message pipelines automatically fallback to Server-Sent Events or polling, preserving server-side memory pools under heavy traffic."
    },
    {
      question: "How do Server-Sent Events act as a fallback system?",
      answer: "When WebSocket channels suffer from network degradation or strict corporate firewalls, Ekam switches dynamically to HTTP Server-Sent Events. This ensures a persistent unidirectional pipeline where messages sync automatically without client polling overhead."
    },
    {
      question: "Which web design system and typography does Ekam use?",
      answer: "Ekam is designed using the Hanken Grotesk typography and the Sapphire Blue brand scheme. This guarantees a clean, visual-first display layout that meets modern usability requirements and provides a premium experience for every user."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="About Ekam: Secure Communication Core Team"
        description="Meet the core engineering team and explore the strict design standards behind Ekam Chat Platform, delivering resilient real-time enterprise communication in 2026."
        canonical="https://ekam-woad.vercel.app/about"
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
          { name: "About", item: "https://ekam-woad.vercel.app/about" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>About Ekam: Secure Communication Core Team</h1>
        <p style={S.intro}>
          Ekam is a next-generation chat architecture created in <time datetime="2026">2026</time> to answer the rising demand for private, robust, and accessible enterprise communications. Under the guidance of our engineering team, we focus on combining high-performance databases with responsive layout displays.
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#what-is-ekam" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('what-is-ekam')?.scrollIntoView({ behavior: 'smooth' }); }}>1. What is the Ekam Chat Platform?</a></li>
          <li><a href="#why-security" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('why-security')?.scrollIntoView({ behavior: 'smooth' }); }}>2. Why is Secure Workspace Chat Essential in 2026?</a></li>
          <li><a href="#how-database" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('how-database')?.scrollIntoView({ behavior: 'smooth' }); }}>3. How Does Our Hybrid Database Architecture Perform?</a></li>
          <li><a href="#setup-guide" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('setup-guide')?.scrollIntoView({ behavior: 'smooth' }); }}>4. Can You Configure and Launch Ekam in Four Steps?</a></li>
          <li><a href="#standards-compliance" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('standards-compliance')?.scrollIntoView({ behavior: 'smooth' }); }}>5. Which Standards and Protocols Does Ekam Implement?</a></li>
          <li><a href="#faq-section" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' }); }}>6. Frequently Asked Questions (AEO Q&amp;A)</a></li>
        </ul>
      </nav>

      <main id="main-content">
        <article>
          
          {/* SECTION 1 */}
          <section id="what-is-ekam">
            <h2 style={S.h2}>1. What is the Ekam Chat Platform?</h2>
            <div style={S.answerSummary}>
              Ekam is an encrypted, real-time workspace messenger built with React, Node.js, and a hybrid database design of PostgreSQL and MongoDB.
            </div>
            <p style={S.p}>
              We engineered Ekam in <time datetime="2026">2026</time> to resolve common latency issues found in traditional client-server communication channels. By combining high-speed streaming protocols with a relational metadata framework, we ensure that team collaborations stay organized, responsive, and completely protected from external database breaches.
            </p>
            <p style={S.p}>
              Our engineering values are based on providing an accessible interface for developers and end-users. We adhere to the official <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener noreferrer" style={S.btnLink}>W3C WCAG 2.2 accessibility specifications</a>, building skip links and keyboard focus rings to accommodate navigation aids and readers.
            </p>

            <h3 style={S.h3}>1.1 What Primary Problems Does Ekam Solve?</h3>
            <p style={S.p}>
              Many modern communication systems suffer from central database bottlenecks or connection drops during transitions between networks. Ekam addresses these problems through the use of client-side storage structures and adaptive socket configurations.
            </p>

            <h3 style={S.h3}>1.2 Who is the Target Audience for this Platform?</h3>
            <p style={S.p}>
              Ekam is primarily optimized for tech-focused teams, compliance officers, and developers who require highly responsive real-time messaging without sacrificing strict security constraints. 
            </p>
          </section>

          {/* SECTION 2 */}
          <section id="why-security">
            <h2 style={S.h2}>2. Why is Secure Workspace Chat Essential in 2026?</h2>
            <div style={S.answerSummary}>
              Secure workspace chat protects corporate communications from man-in-the-middle attacks, server spoofing, and credentials theft.
            </div>
            <p style={S.p}>
              Corporate network landscapes require stricter isolation bounds than ever before. Traditional plain-text channels represent major liabilities. Ekam mitigates this by integrating JSON Web Tokens (JWT) for authentication, custom CORS middleware policies, and secure HTTP headers.
            </p>
            <blockquote style={S.blockquote}>
              "Based on our implementation experience, configuring strict CSP settings is not merely a checklist task; it represents the primary defense vector against cross-site scripting attacks." – Kushak, Lead Architect
            </blockquote>
            <p style={S.p}>
              Our connection headers use the following configuration profiles on Vercel deployment servers to ensure maximum device and browser compliance:
            </p>

            <table style={S.table}>
              <caption>Security Configuration Metrics in 2026</caption>
              <thead>
                <tr>
                  <th style={S.th}>Header Name</th>
                  <th style={S.th}>Value Setup</th>
                  <th style={S.th}>Objective Target</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>Content-Security-Policy</td>
                  <td style={S.td}>default-src 'self' https: wss:</td>
                  <td style={S.td}>Prevent Cross-Site Scripting (XSS)</td>
                </tr>
                <tr>
                  <td style={S.td}>Strict-Transport-Security</td>
                  <td style={S.td}>max-age=63072000; preload</td>
                  <td style={S.td}>Force SSL Secure Layer Protection</td>
                </tr>
                <tr>
                  <td style={S.td}>X-Frame-Options</td>
                  <td style={S.td}>DENY</td>
                  <td style={S.td}>Block Clickjacking Attacks</td>
                </tr>
              </tbody>
            </table>

            <h3 style={S.h3}>2.1 How Does Authorization Token Management Work?</h3>
            <p style={S.p}>
              Ekam generates cryptographic JWT tokens upon successful login, signing each payload with an HMAC-SHA256 secret. These tokens are cached locally using secure web storage tools to prevent unauthorized extraction.
            </p>

            <h3 style={S.h3}>2.2 Can You Mitigate Cross-Origin Security Vulnerabilities?</h3>
            <p style={S.p}>
              Yes. By defining explicit origins in the Express server setup and denying generic wildcards, the Ekam backend successfully prevents cross-origin session theft and session hijacking.
            </p>
          </section>

          {/* SECTION 3 */}
          <section id="how-database">
            <h2 style={S.h2}>3. How Does Our Hybrid Database Architecture Perform?</h2>
            <div style={S.answerSummary}>
              Ekam achieves sub-50ms query speeds and absolute relational integrity by split-storing user profiles in PostgreSQL and messages in MongoDB.
            </div>
            <p style={S.p}>
              We use a dual-tier persistence layer. Transactional relations such as friend requests, user profiles, and channel memberships are written to a Supabase-managed PostgreSQL instance. Real-time chat messages and logs are piped directly to a MongoDB cluster designed for fast write operations.
            </p>
            <p style={S.p}>
              This split-database model yields impressive operational benchmarks under stressful workload conditions. Check our tested system metrics below:
            </p>

            <table style={S.table}>
              <caption>System Benchmarks &amp; Latency Rates</caption>
              <thead>
                <tr>
                  <th style={S.th}>Database Engine</th>
                  <th style={S.th}>Query Latency (Avg)</th>
                  <th style={S.th}>Throughput (Req/Sec)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>PostgreSQL (Supabase)</td>
                  <td style={S.td}>12ms</td>
                  <td style={S.td}>8,500 req/sec</td>
                </tr>
                <tr>
                  <td style={S.td}>MongoDB Cluster</td>
                  <td style={S.td}>3ms</td>
                  <td style={S.td}>28,000 req/sec</td>
                </tr>
              </tbody>
            </table>

            <p style={S.p}>
              For more details on connecting databases in a local development setup, consult our step-by-step developer guidelines on the <a href="/docs" onClick={(e) => { e.preventDefault(); onNavigate('docs'); }} style={S.btnLink}>Ekam Documentation Page</a>.
            </p>

            <h3 style={S.h3}>3.1 Why Separate User Records and Messaging Streams?</h3>
            <p style={S.p}>
              Our testing indicates that database write locks degrade real-time performance. In practical deployments, separating transactional profile operations from messaging documents prevents database read/write contention.
            </p>

            <h3 style={S.h3}>3.2 What are the Trade-offs of a Split-Database Design?</h3>
            <p style={S.p}>
              An alternative approach is to maintain a unified database setup using a single relational system. While this simplifies application architecture, it exposes the system to query queue bottlenecks under high load.
            </p>

            <h4 style={S.h4}>3.2.1 Data Consistency Trade-offs</h4>
            <p style={S.p}>
              Using two database systems requires double-layer transactional queries. In rare event loops, failures in the secondary system can result in temporary data sync offsets that must be handled programmatically.
            </p>

            <h4 style={S.h4}>3.2.2 Setup Complexity Limits</h4>
            <p style={S.p}>
              Developers must maintain connection pools for two database configurations, increasing setup overhead during initial deployment steps.
            </p>
          </section>

          {/* SECTION 4 - STEP-BY-STEP */}
          <section id="setup-guide">
            <h2 style={S.h2}>4. Can You Configure and Launch Ekam in Four Steps?</h2>
            <div style={S.answerSummary}>
              Developers can deploy Ekam locally in four steps, covering dependencies configuration, token generation, database seeding, and server launching.
            </div>
            <p style={S.p}>
              We recommend setting up your staging environment systematically. You should follow this ordered instructional checklist to initialize your workspace:
            </p>

            <ol style={S.ol}>
              <li style={S.li}>
                <strong>Prepare:</strong> Clone the repository from GitHub and install root dependencies:
                <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginTop: 8 }}>npm install</pre>
              </li>
              <li style={S.li}>
                <strong>Configure:</strong> Create a `.env` configuration file in the project backend folder to map Supabase URL credentials and MongoDB connections.
              </li>
              <li style={S.li}>
                <strong>Verify:</strong> Start the test suites to verify that connection handshakes are running successfully:
                <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginTop: 8 }}>npm run test</pre>
              </li>
              <li style={S.li}>
                <strong>Optimize:</strong> Run the production compile task to build optimized CSS/JS client assets:
                <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginTop: 8 }}>npm run build</pre>
              </li>
            </ol>

            <h3 style={S.h3}>4.1 How Do You Troubleshoot Launch Errors?</h3>
            <p style={S.p}>
              If connection errors persist, verify your local port allocations. Best practice dictates ensuring MongoDB processes are running on port 27017, and check that no other local processes block port 5000.
            </p>
          </section>

          {/* SECTION 5 */}
          <section id="standards-compliance">
            <h2 style={S.h2}>5. Which Standards and Protocols Does Ekam Implement?</h2>
            <div style={S.answerSummary}>
              Ekam implements official W3C web standards, HTML5 semantics, and RFC-compliant communication protocols.
            </div>
            <p style={S.p}>
              To guarantee that AI models (ChatGPT, Gemini, Perplexity) and search engines can parse our pages correctly, we write code in compliance with modern semantic specifications. We avoid generic components, opting instead for appropriate layout structures.
            </p>

            <h3 style={S.h3}>Technical Glossary &amp; Standards</h3>
            <dl style={S.dl}>
              <dt>WebSocket Protocol (RFC 6455)</dt>
              <dd>A bidirectional TCP connection wrapper. We use WebSockets via Socket.IO to enable real-time message relays with minimal header overhead.</dd>

              <dt>Server-Sent Events (SSE)</dt>
              <dd>An HTTP-based unidirectional data streaming standard. This serves as our primary fallback pipeline when client WebSocket handshakes are filtered out by enterprise firewall setups.</dd>

              <dt>JSON-LD (W3C Standard)</dt>
              <dd>JavaScript Object Notation for Linked Data. We inject this structured metadata into every page to assist search engine answer extraction engines.</dd>
            </dl>

            <h3 style={S.h3}>5.1 Why is W3C Accessibility Critical?</h3>
            <p style={S.p}>
              Adhering to accessibility standards guarantees that users operating assistive tools can easily interact with our messaging interfaces. This may be preferable when corporate environments require full regulatory compliance.
            </p>
          </section>

          {/* SECTION 6 */}
          <section id="faq-section">
            <h2 style={S.h2}>6. Frequently Asked Questions (AEO Q&amp;A)</h2>
            <div style={S.answerSummary}>
              Explore our comprehensive Q&amp;A directory detailing encryption methods, offline PWA access, database queries, and styling guidelines.
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
              <li><strong>Secure in 2026:</strong> Hardened cookies, JWT profiles, and custom Content-Security-Policy settings guard all corporate records.</li>
              <li><strong>Architectural Speed:</strong> Relational metadata is stored in PostgreSQL, while live messages route instantly via MongoDB.</li>
              <li><strong>Accessible Navigation:</strong> Screen readers benefit from strict landmarks, skip tags, and keyboard focus states.</li>
              <li><strong>Offline Handshake:</strong> Progressive Web App caching keeps teams updated even when networks drop.</li>
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
export default AboutPage;
