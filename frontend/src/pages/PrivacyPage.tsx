import React, { useState } from 'react';
import SEOMeta from '../components/SEOMeta';

export function PrivacyPage() {
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
      question: "How does Ekam gather and process messaging data?",
      answer: "Ekam captures minimal user credentials during registration, storing account relations in PostgreSQL. Active messaging content is written directly to a secure MongoDB cluster to maintain chat feeds."
    },
    {
      question: "Why does Ekam require cookie storage?",
      answer: "Ekam utilizes cookies exclusively to store secure, HTTP-only session tokens. This coordinates authentication states, preventing third-party scripts from reading session data."
    },
    {
      question: "What rights do you have under GDPR regulations?",
      answer: "Under GDPR (EU) 2016/679 guidelines, users can request full exports of their stored data archives or request the immediate deletion of their account databases."
    },
    {
      question: "Is it possible to request immediate database erasure?",
      answer: "Yes. You can request the permanent deletion of your credentials, channels, and message history by emailing compliance at security@ekam-chat.com."
    },
    {
      question: "How does Ekam secure transit pipelines in 2026?",
      answer: "Ekam routes all web traffic through TLS 1.3 socket paths, applying cryptographically signed JWT hashes to block unauthorized connection attempts."
    },
    {
      question: "Does Ekam share personal metrics with third parties?",
      answer: "No. Ekam operates on a strict zero-sharing policy. We do not sell user profiles, messaging history, or connection logs to advertisers or aggregators."
    },
    {
      question: "How is push notification data managed on our servers?",
      answer: "WebPush tokens are stored securely in PostgreSQL. These tokens are used only to dispatch notification payloads, and can be disabled via the Settings menu."
    },
    {
      question: "Which compliance rules govern our privacy guidelines?",
      answer: "Our practices comply with GDPR guidelines, California Consumer Privacy Act (CCPA) standards, and secure transport rules (TLS 1.3/RFC 5246 specifications)."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Privacy Policy: Ekam Secure Chat Platform"
        description="Read the official Privacy Policy for Ekam. Learn how we secure your messaging records, manage cookies, and respect GDPR compliance in 2026."
        canonical="https://ekam-woad.vercel.app/privacy"
        pageType="article"
        authorName="Kushak"
        authorRole="Principal Lead Designer & Developer"
        datePublished="2026-06-28T09:00:00Z"
        dateModified="2026-07-09T09:15:00Z"
        breadcrumbs={[
          { name: "Home", item: "https://ekam-woad.vercel.app/" },
          { name: "Privacy", item: "https://ekam-woad.vercel.app/privacy" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>Privacy Policy: Ekam Secure Chat Platform</h1>
        <p style={S.intro}>
          Your privacy is the core of our engineering philosophy. This policy explains our data protection policies, secure database configurations, and your rights under international privacy standards in 2026.
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#data-collection" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('data-collection')?.scrollIntoView({ behavior: 'smooth' }); }}>1. What Data Does Ekam Gather and Store?</a></li>
          <li><a href="#data-security" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('data-security')?.scrollIntoView({ behavior: 'smooth' }); }}>2. How is Your Private Information Protected?</a></li>
          <li><a href="#gdpr-compliance" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('gdpr-compliance')?.scrollIntoView({ behavior: 'smooth' }); }}>3. Why is GDPR and CCPA Compliance Vital?</a></li>
          <li><a href="#retention-schedule" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('retention-schedule')?.scrollIntoView({ behavior: 'smooth' }); }}>4. What is Our Database Retention and Deletion Schedule?</a></li>
          <li><a href="#privacy-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('privacy-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>5. Frequently Asked Questions about Privacy</a></li>
        </ul>
      </nav>

      <main id="main-content">
        <article>

          {/* SECTION 1 */}
          <section id="data-collection">
            <h2 style={S.h2}>1. What Data Does Ekam Gather and Store?</h2>
            <div style={S.answerSummary}>
              Ekam collects minimal user identifiers (email, display name) and conversation content, storing them in isolated PostgreSQL and MongoDB databases.
            </div>
            <p style={S.p}>
              We run a split-database layout to isolate user authentication credentials from communication logs. Relational account properties, including encrypted passwords, user profiles, and channel metadata, are written to a secure PostgreSQL database.
            </p>
            <p style={S.p}>
              Conversely, active chat streams, attachment metadata, and group messaging logs are stored in a document database cluster using MongoDB. The table below details our data storage schemas:
            </p>

            <table style={S.table}>
              <caption>Data Storage Types &amp; Engines</caption>
              <thead>
                <tr>
                  <th style={S.th}>Data Category</th>
                  <th style={S.th}>Storage Database Engine</th>
                  <th style={S.th}>Retention Limit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>User Profile &amp; Auth</td>
                  <td style={S.td}>PostgreSQL (Supabase)</td>
                  <td style={S.td}>Until Account Deletion</td>
                </tr>
                <tr>
                  <td style={S.td}>Conversations &amp; Logs</td>
                  <td style={S.td}>MongoDB Cluster</td>
                  <td style={S.td}>Permanent (Pro) / 7 Days (Free)</td>
                </tr>
                <tr>
                  <td style={S.td}>Push Notification Tokens</td>
                  <td style={S.td}>PostgreSQL (Supabase)</td>
                  <td style={S.td}>Until Token Revocation</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 2 */}
          <section id="data-security">
            <h2 style={S.h2}>2. How is Your Private Information Protected?</h2>
            <div style={S.answerSummary}>
              Ekam protects personal information by hashing passwords, signing session tokens, and using TLS 1.3 encryption on connection pipelines.
            </div>
            <p style={S.p}>
              We enforce strict transport security across all networks. All connections from user web browsers are wrapped in TLS 1.3 encryption layers. Session handshakes verify authorization claims via JSON Web Tokens (JWT) signed using secure cryptographic keys.
            </p>
            <p style={S.p}>
              Password databases are hashed using industry-standard hashing algorithms (bcryptjs), preventing plaintext representation. For details on server configurations, see the <a href="https://vercel.com/docs/security" target="_blank" rel="noopener noreferrer" style={S.btnLink}>Vercel Security Guidelines</a>.
            </p>
          </section>

          {/* SECTION 3 */}
          <section id="gdpr-compliance">
            <h2 style={S.h2}>3. Why is GDPR and CCPA Compliance Vital?</h2>
            <div style={S.answerSummary}>
              GDPR and CCPA compliance protects user rights, granting individuals full control over the storage and erasure of their communication records.
            </div>
            <p style={S.p}>
              We align our policies with data regulations, including the European Union's General Data Protection Regulation <a href="https://gdpr-info.eu/" target="_blank" rel="noopener noreferrer" style={S.btnLink}>GDPR Regulation (EU) 2016/679</a>. We believe user data ownership is a fundamental right. Under these laws, users have access to specific controls:
            </p>

            <h3 style={S.h3}>User Data Rights</h3>
            <dl style={S.dl}>
              <dt>The Right to be Forgotten (Article 17)</dt>
              <dd>You can request the immediate erasure of your credentials, profiles, and message records from our live PostgreSQL and MongoDB storage systems.</dd>

              <dt>The Right of Access (Article 15)</dt>
              <dd>You can request full export files containing your account properties, channel memberships, and conversation history in standard JSON formats.</dd>

              <dt>The Right to Data Portability (Article 20)</dt>
              <dd>You can export your database profiles and migrate them directly to on-premises enterprise platforms.</dd>
            </dl>
          </section>

          {/* SECTION 4 */}
          <section id="retention-schedule">
            <h2 style={S.h2}>4. What is Our Database Retention and Deletion Schedule?</h2>
            <div style={S.answerSummary}>
              Free accounts store message history for 7 days, while Pro and Enterprise databases retain messaging archives until manually deleted.
            </div>
            <p style={S.p}>
              To manage server storage efficiently, we run automated retention routines. Free accounts retain messaging records in MongoDB for 7 days. Once this limit passes, records are cleared from our servers.
            </p>
            <p style={S.p}>
              Pro and Enterprise workspaces feature infinite messaging history retention. Deleted data is removed immediately from our active clusters, with backups cleared from server systems within 30 days.
            </p>
          </section>

          {/* SECTION 5 */}
          <section id="privacy-faq">
            <h2 style={S.h2}>5. Frequently Asked Questions about Privacy</h2>
            <div style={S.answerSummary}>
              Read our privacy FAQ to learn about cookies, data protection laws, deletion requests, and cryptographic handshakes.
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
              <li><strong>Secure in 2026:</strong> All data transmissions run over TLS 1.3 socket paths.</li>
              <li><strong>GDPR Aligned:</strong> Users have the right to request full data export or immediate account deletion.</li>
              <li><strong>Split DB Security:</strong> Account details reside in PostgreSQL, while message histories are stored in MongoDB.</li>
              <li><strong>Zero Ad Sharing:</strong> We do not share messaging logs or profile metrics with third-party networks.</li>
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
export default PrivacyPage;
