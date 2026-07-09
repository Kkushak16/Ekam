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
      question: "How can I request complete data deletion from Ekam?",
      answer: "You can trigger full account purging directly from your profile dashboard settings. All relational user credentials and associated MongoDB documents clear immediately."
    },
    {
      question: "Are messages encrypted inside the MongoDB database?",
      answer: "Yes. Message streams are encrypted both in transit using TLS 1.3 socket protocols and at rest within MongoDB clusters."
    },
    {
      question: "Does Ekam share user logs with third-party networks?",
      answer: "No. We do not sell user profiles or tracking logs to third-party ad networks. All logs remain isolated within our primary systems."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Privacy Policy: Ekam Secure Chat Platform"
        description="Your privacy is core. Learn about our database isolation, GDPR user rights, and TLS 1.3 socket transmission security guidelines in 2026."
        canonical="https://ekam-woad.vercel.app/privacy"
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
          { name: "Privacy", item: "https://ekam-woad.vercel.app/privacy" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>Privacy Policy: Ekam Secure Chat Platform</h1>
        <p style={S.intro}>
          Your privacy is the core of our engineering philosophy. This policy explains our data protection policies, secure database configurations, and your rights under international privacy standards in <time datetime="2026">2026</time>.
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#data-collection" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('data-collection')?.scrollIntoView({ behavior: 'smooth' }); }}>1. What Data Does Ekam Gather and Store?</a></li>
          <li><a href="#data-security" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('data-security')?.scrollIntoView({ behavior: 'smooth' }); }}>2. How is Your Private Information Protected?</a></li>
          <li><a href="#gdpr-compliance" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('gdpr-compliance')?.scrollIntoView({ behavior: 'smooth' }); }}>3. Why is GDPR and CCPA Compliance Vital?</a></li>
          <li><a href="#gdpr-steps" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('gdpr-steps')?.scrollIntoView({ behavior: 'smooth' }); }}>4. Can You File a GDPR Data Request in Four Steps?</a></li>
          <li><a href="#retention-schedule" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('retention-schedule')?.scrollIntoView({ behavior: 'smooth' }); }}>5. What is Our Database Retention and Deletion Schedule?</a></li>
          <li><a href="#privacy-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('privacy-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>6. Frequently Asked Questions about Privacy</a></li>
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
                  <td style={S.td}>Network Connection Logs</td>
                  <td style={S.td}>Redis Memory Cache</td>
                  <td style={S.td}>Temporary Session Only</td>
                </tr>
              </tbody>
            </table>

            <h3 style={S.h3}>1.1 Do We Track Device Location Metrics?</h3>
            <p style={S.p}>
              No. We do not capture global positioning system (GPS) metrics or track user movements across external sites.
            </p>

            <h3 style={S.h3}>1.2 Are Cookie Assets Used for Advertising?</h3>
            <p style={S.p}>
              No. Cookies are exclusively reserved for auth state persistence, protecting active sessions from CSRF exploits.
            </p>
          </section>

          {/* SECTION 2 */}
          <section id="data-security">
            <h2 style={S.h2}>2. How is Your Private Information Protected?</h2>
            <div style={S.answerSummary}>
              Information is protected by hashing credentials with bcryptjs, encrypting socket feeds with TLS 1.3, and applying strict CORS boundaries.
            </div>
            <p style={S.p}>
              We implement comprehensive security middleware across all network endpoints. Every request routes through verification filters to confirm the presence of signed JWT authorization headers.
            </p>
            <blockquote style={S.blockquote}>
              "Based on our implementation experience, utilizing bcryptjs for credentials hashing with a default salt factor of 10 provides solid protection against offline brute-force attacks." – Kushak, Developer
            </blockquote>
            <p style={S.p}>
              You should verify that your browser enforces SSL lock status indicators when logging into your account.
            </p>

            <h3 style={S.h3}>2.1 How Do Socket Filters Mitigate Attacks?</h3>
            <p style={S.p}>
              We implement origin restriction middleware inside Express, blocking requests originating from unauthorized third-party pages.
            </p>

            <h3 style={S.h3}>2.2 Can We Disable Database Logging for Rooms?</h3>
            <p style={S.p}>
              An alternative approach is utilizing end-to-end ephemeral channels where messages bypass database persistence entirely, which may be preferable for highly sensitive team discussions.
            </p>
          </section>

          {/* SECTION 3 */}
          <section id="gdpr-compliance">
            <h2 style={S.h2}>3. Why is GDPR and CCPA Compliance Vital?</h2>
            <div style={S.answerSummary}>
              Compliance ensures users maintain legal rights to access, export, modify, or completely delete personal data files from database records.
            </div>
            <p style={S.p}>
              Ekam supports your rights under the <a href="https://gdpr-info.eu/" target="_blank" rel="noopener noreferrer" style={S.btnLink}>European Union General Data Protection Regulation (GDPR)</a>. We believe user data ownership is a fundamental human right. Accordingly, we do not require complex forms to execute data deletion.
            </p>

            <h3 style={S.h3}>3.1 What User Rights are Guaranteed?</h3>
            <p style={S.p}>
              You maintain rights of access, rectification, portability, restriction of processing, and erasure. All rights can be activated via account configuration menus.
            </p>

            <h3 style={S.h3}>3.2 How Can California Residents Execute CCPA Rights?</h3>
            <p style={S.p}>
              California users benefit from identical rights. We extend CCPA data deletion and access tools to all users globally.
            </p>
          </section>

          {/* SECTION 4 - STEP-BY-STEP */}
          <section id="gdpr-steps">
            <h2 style={S.h2}>4. Can You File a GDPR Data Request in Four Steps?</h2>
            <div style={S.answerSummary}>
              Request and export your personal data files in four steps: accessing panels, requesting extracts, confirming emails, and downloading archives.
            </div>
            <p style={S.p}>
              If you want to request an export of all your communication logs, follow this ordered instructional checklist:
            </p>

            <ol style={S.ol}>
              <li style={S.li}>
                <strong>Navigate:</strong> Enter your dashboard and click the settings icon on the navigation panel.
              </li>
              <li style={S.li}>
                <strong>Select:</strong> Go to the "Privacy Options" sub-menu and choose the "Export Account Files" option.
              </li>
              <li style={S.li}>
                <strong>Confirm:</strong> Validate your identity by entering your secure login password.
              </li>
              <li style={S.li}>
                <strong>Download:</strong> Retrieve the JSON-encoded archive file sent to your verified registration email.
              </li>
            </ol>
          </section>

          {/* SECTION 5 */}
          <section id="retention-schedule">
            <h2 style={S.h2}>5. What is Our Database Retention and Deletion Schedule?</h2>
            <div style={S.answerSummary}>
              Ekam operates clean retention schedules, clearing inactive logs and purging deleted accounts within 24 hours.
            </div>
            <p style={S.p}>
              Our backend executes automated cleanup tasks to maintain server efficiency. We define data retention parameters below:
            </p>

            <h3 style={S.h3}>Data Retention Glossary</h3>
            <dl style={S.dl}>
              <dt>Free Tier Retention</dt>
              <dd>Conversational log documents are automatically deleted from MongoDB collections after 7 days.</dd>

              <dt>Account Purging</dt>
              <dd>Relational user data is permanently deleted from PostgreSQL database tables within 24 hours of requesting account cancellation.</dd>

              <dt>Message Archiving</dt>
              <dd>The process of backing up logs into cold storage to preserve database response times.</dd>
            </dl>
          </section>

          {/* SECTION 6 */}
          <section id="privacy-faq">
            <h2 style={S.h2}>6. Frequently Asked Questions about Privacy</h2>
            <div style={S.answerSummary}>
              Review our FAQ for quick answers regarding GDPR, encryption, databases, and logs.
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
              <li><strong>Absolute Privacy in 2026:</strong> Your text histories are isolated from external analytics scripts.</li>
              <li><strong>GDPR Complete:</strong> Download, export, or permanently erase records at any time via settings.</li>
              <li><strong>Robust Encryption:</strong> Secure all transit feeds using TLS 1.3 socket paths.</li>
              <li><strong>Zero Ad Sharing:</strong> We do not sell tracking profiles to external data brokers.</li>
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
export default PrivacyPage;
