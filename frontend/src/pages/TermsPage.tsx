import React, { useState } from 'react';
import SEOMeta from '../components/SEOMeta';

export function TermsPage() {
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
      question: "Can I host the Ekam messaging client on our private servers?",
      answer: "Yes. Our standard client repository is fully open-source and customizable, permitting private self-hosting options under the MIT license."
    },
    {
      question: "Are there penalties for exceeding subscription message limits?",
      answer: "No. Instead of harsh penalties, we temporarily queue extra messages until your workspace resource quota resets or is upgraded."
    },
    {
      question: "How are intellectual property rights managed for shared files?",
      answer: "You retain full copyright over all text and media uploaded to your workspace. Ekam holds no ownership claims over your content files."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Terms of Service: Ekam Chat Workspace Rules"
        description="Read our legal terms of service. Understand account registration, client hosting guidelines, platform limits, and warranty disclaimers in 2026."
        canonical="https://ekam-woad.vercel.app/terms"
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
          { name: "Terms", item: "https://ekam-woad.vercel.app/terms" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>Terms of Service: Ekam Chat Workspace Rules</h1>
        <p style={S.intro}>
          Thank you for choosing Ekam. This agreement outlines your legal rights, acceptable messaging practices, account responsibilities, and our server availability disclaimers for <time datetime="2026">2026</time>.
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#account-auth" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('account-auth')?.scrollIntoView({ behavior: 'smooth' }); }}>1. What are the Account Registration and Safety Rules?</a></li>
          <li><a href="#acceptable-use" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('acceptable-use')?.scrollIntoView({ behavior: 'smooth' }); }}>2. What Code of Conduct Governs our Channels?</a></li>
          <li><a href="#service-warranties" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('service-warranties')?.scrollIntoView({ behavior: 'smooth' }); }}>3. What Warranties Cover our Backend Servers?</a></li>
          <li><a href="#account-steps" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('account-steps')?.scrollIntoView({ behavior: 'smooth' }); }}>4. Can You Secure Your Workspace Settings in Four Steps?</a></li>
          <li><a href="#terms-glossary" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('terms-glossary')?.scrollIntoView({ behavior: 'smooth' }); }}>5. What are the Service Glossary Definitions?</a></li>
          <li><a href="#terms-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('terms-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>6. Frequently Asked Questions about our Terms</a></li>
        </ul>
      </nav>

      <main id="main-content">
        <article>

          {/* SECTION 1 */}
          <section id="account-auth">
            <h2 style={S.h2}>1. What are the Account Registration and Safety Rules?</h2>
            <div style={S.answerSummary}>
              Users must provide valid login credentials and remain responsible for all messaging activity under their registered profile.
            </div>
            <p style={S.p}>
              To register a user profile on the Ekam platform, you must supply an authorized email address or phone credential. Account setups are personal and cannot be traded. Users are required to safeguard their passwords and session credentials.
            </p>
            <p style={S.p}>
              Ekam integrates directly with Supabase authentication pipelines. If you notice unauthorized access to your account, alert our support staff immediately. For details, refer to the <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" style={S.btnLink}>Supabase Auth Documentation</a>.
            </p>

            <h3 style={S.h3}>1.1 Are Shared Auth Profiles Allowed?</h3>
            <p style={S.p}>
              No. We enforce unique user profiles to maintain chat channel integrity and prevent spoofing.
            </p>

            <h3 style={S.h3}>1.2 What Happens If Credentials Are Compromised?</h3>
            <p style={S.p}>
              Users should trigger password recovery sequences or email support for account lockdown.
            </p>
          </section>

          {/* SECTION 2 */}
          <section id="acceptable-use">
            <h2 style={S.h2}>2. What Code of Conduct Governs our Channels?</h2>
            <div style={S.answerSummary}>
              Ekam channels prohibit spamming, distributing malware, or executing automated scripts that stress our database APIs.
            </div>
            <p style={S.p}>
              Ekam is designed to facilitate secure, professional team collaborations. While we support custom developer integrations, automated bots must route messages using official webhooks.
            </p>
            <p style={S.p}>
              Below is a summary of our account limits and policies:
            </p>

            <table style={S.table}>
              <caption>Platform Limits &amp; Guidelines</caption>
              <thead>
                <tr>
                  <th style={S.th}>Feature Element</th>
                  <th style={S.th}>Free Tier Boundary</th>
                  <th style={S.th}>Pro Tier Boundary</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>Message Frequency</td>
                  <td style={S.td}>60 messages per minute</td>
                  <td style={S.td}>Unlimited throughput</td>
                </tr>
                <tr>
                  <td style={S.td}>Storage Capacity</td>
                  <td style={S.td}>1 GB total space</td>
                  <td style={S.td}>100 GB per workspace</td>
                </tr>
                <tr>
                  <td style={S.td}>API Integrations</td>
                  <td style={S.td}>Not supported</td>
                  <td style={S.td}>Full webhook accessibility</td>
                </tr>
              </tbody>
            </table>

            <h3 style={S.h3}>2.1 Can We Transmit Automated API Requests?</h3>
            <p style={S.p}>
              Yes, provided that your client integrates using the standard REST endpoints or official socket channels.
            </p>

            <h3 style={S.h3}>2.2 What Actions Trigger Automated Suspensions?</h3>
            <p style={S.p}>
              A user account might be flagged and locked if our rate-limiting middleware catches persistent socket flood spikes.
            </p>
          </section>

          {/* SECTION 3 */}
          <section id="service-warranties">
            <h2 style={S.h2}>3. What Warranties Cover our Backend Servers?</h2>
            <div style={S.answerSummary}>
              Ekam is provided "as is" without warranty of any kind, though we strive for 99.9% uptime on all Pro-tier hosting nodes.
            </div>
            <p style={S.p}>
              While we use robust server frameworks, including Supabase database triggers, we do not guarantee uninterrupted platform access. Software upgrades and database migrations may necessitate brief scheduled maintenance downtime.
            </p>
            <blockquote style={S.blockquote}>
              "Based on our implementation experience, maintaining clear liability disclaimers is necessary to prevent legal disputes over unexpected server upgrades." – Kushak, Developer
            </blockquote>
            <p style={S.p}>
              Users should back up critical conversation files using our built-in JSON data export tools.
            </p>

            <h3 style={S.h3}>3.1 Is There an SLA for Standard Accounts?</h3>
            <p style={S.p}>
              No. Standard tiers run without SLA guarantees, which is common for developer development environments.
            </p>

            <h3 style={S.h3}>3.2 How Are Disputes Resolved?</h3>
            <p style={S.p}>
              On the other hand, contract arguments should be routed to arbitration under local jurisdictional courts.
            </p>
          </section>

          {/* SECTION 4 - STEP-BY-STEP */}
          <section id="account-steps">
            <h2 style={S.h2}>4. Can You Secure Your Workspace Settings in Four Steps?</h2>
            <div style={S.answerSummary}>
              Secure workspace configurations in four steps: accessing security menus, choosing password factors, checking devices, and generating keys.
            </div>
            <p style={S.p}>
              To secure your Ekam user profile against threat vectors, complete this ordered checklist:
            </p>

            <ol style={S.ol}>
              <li style={S.li}>
                <strong>Navigate:</strong> Access the user configuration panel from the sidebar menu.
              </li>
              <li style={S.li}>
                <strong>Verify:</strong> Enable two-factor verification using a hardware token or phone app.
              </li>
              <li style={S.li}>
                <strong>Audit:</strong> Inspect the active browser sessions list to verify that only your devices have access.
              </li>
              <li style={S.li}>
                <strong>Back Up:</strong> Save your recovery credentials in a secure manager location.
              </li>
            </ol>
          </section>

          {/* SECTION 5 */}
          <section id="terms-glossary">
            <h2 style={S.h2}>5. What are the Service Glossary Definitions?</h2>
            <div style={S.answerSummary}>
              Understand the core legal definitions used across our terms of service agreement.
            </div>
            <p style={S.p}>
              We define the core operational legal terms of our messaging service below:
            </p>

            <h3 style={S.h3}>Acceptable Terms Glossary</h3>
            <dl style={S.dl}>
              <dt>Workspace Owner</dt>
              <dd>The primary billing account that manages channels, roles, and integrations.</dd>

              <dt>Service Downtime</dt>
              <dd>Periods when our databases or API sockets fail to accept connection handshakes.</dd>

              <dt>Ephemeral Message</dt>
              <dd>A text block that clears from server memory immediately after delivery to recipients.</dd>
            </dl>
          </section>

          {/* SECTION 6 */}
          <section id="terms-faq">
            <h2 style={S.h2}>6. Frequently Asked Questions about our Terms</h2>
            <div style={S.answerSummary}>
              Review our FAQ for quick answers regarding client licenses, subscriptions, and code modifications.
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
              <li><strong>User Content Ownership:</strong> You retain complete intellectual rights to uploaded text and files.</li>
              <li><strong>Self-Hosting License:</strong> Host your messaging client privately under standard MIT guidelines.</li>
              <li><strong>Acceptable Conduct:</strong> Spamming or flooding websocket connections violates the service agreement.</li>
              <li><strong>Warranty Disclaimer:</strong> System availability is offered "as is" without liability for data loss.</li>
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
export default TermsPage;
