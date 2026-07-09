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
      question: "What rules govern Ekam user accounts?",
      answer: "Users must register using legitimate, authorized email credentials. You remain responsible for all chat messaging, group creation, and media transmissions made under your session profile."
    },
    {
      question: "Are automated messaging bots permitted on Ekam?",
      answer: "Automated integrations are allowed through our official developer webhooks. However, spam bots or scripts that flood channels, bypass rate limits, or stress test servers are strictly banned."
    },
    {
      question: "Does Ekam guarantee constant platform connection uptime?",
      answer: "While we operate multiple redundant Server-Sent Events (SSE) and HTTP polling channels, we provide service connection disclaimers, offering warranties exclusively under Enterprise SLAs."
    },
    {
      question: "How are copyright and DMCA violations handled?",
      answer: "If you detect unauthorized sharing of intellectual property on our databases, you can submit a removal request to our compliance division at support@ekam-chat.com."
    },
    {
      question: "What is the minimum age to register on Ekam?",
      answer: "Ekam services are designed for developer collaborations and business operations. Users must be at least 13 years of age to register an active chat profile."
    },
    {
      question: "Under what conditions can an account be suspended?",
      answer: "We reserve the right to lock user profiles or shut down workspaces that violate our acceptable use standards, transmit malware, or launch brute force login attacks."
    },
    {
      question: "Where are legal disputes resolved?",
      answer: "These Terms of Service are governed by the laws of the State of California. Any formal legal actions must be resolved in courts located in San Francisco County."
    },
    {
      question: "How do you close or terminate your Ekam account?",
      answer: "You can terminate your service agreement and clear your personal database records at any time by selecting the Delete Profile button in your account settings."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Terms of Service: Ekam Chat Workspace Rules"
        description="Read the terms of service governing the use of the Ekam Chat Platform, workspace boundaries, and account safety compliance requirements in 2026."
        canonical="https://ekam-woad.vercel.app/terms"
        pageType="article"
        authorName="Kushak"
        authorRole="Principal Lead Designer & Developer"
        datePublished="2026-06-28T09:00:00Z"
        dateModified="2026-07-09T09:15:00Z"
        breadcrumbs={[
          { name: "Home", item: "https://ekam-woad.vercel.app/" },
          { name: "Terms", item: "https://ekam-woad.vercel.app/terms" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>Terms of Service: Ekam Chat Workspace Rules</h1>
        <p style={S.intro}>
          Thank you for choosing Ekam. This agreement outlines your legal rights, acceptable messaging practices, account responsibilities, and our server availability disclaimers for 2026.
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#account-auth" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('account-auth')?.scrollIntoView({ behavior: 'smooth' }); }}>1. What are the Account Registration and Safety Rules?</a></li>
          <li><a href="#acceptable-use" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('acceptable-use')?.scrollIntoView({ behavior: 'smooth' }); }}>2. What Code of Conduct Governs our Channels?</a></li>
          <li><a href="#service-warranties" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('service-warranties')?.scrollIntoView({ behavior: 'smooth' }); }}>3. What Warranties Cover our Backend Servers?</a></li>
          <li><a href="#terms-glossary" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('terms-glossary')?.scrollIntoView({ behavior: 'smooth' }); }}>4. What are the Service Glossary Definitions?</a></li>
          <li><a href="#terms-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('terms-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>5. Frequently Asked Questions about our Terms</a></li>
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
                  <th style={S.th}>Operational Limit</th>
                  <th style={S.th}>Action on Violation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>Spam Rate Limit</td>
                  <td style={S.td}>Max 60 messages/minute</td>
                  <td style={S.td}>Temporary IP Socket block</td>
                </tr>
                <tr>
                  <td style={S.td}>Webhook Payloads</td>
                  <td style={S.td}>Max 2MB per request</td>
                  <td style={S.td}>Automatic Payload Rejection</td>
                </tr>
                <tr>
                  <td style={S.td}>Account Names</td>
                  <td style={S.td}>Must not impersonate others</td>
                  <td style={S.td}>Account lock and name purge</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 3 */}
          <section id="service-warranties">
            <h2 style={S.h2}>3. What Warranties Cover our Backend Servers?</h2>
            <div style={S.answerSummary}>
              Ekam is provided "as is", disclaiming any implied warranties of merchantability or constant network connectivity.
            </div>
            <p style={S.p}>
              We run multiple redundant servers, utilizing WebSockets and Server-Sent Events (SSE) to ensure fast delivery. However, we do not warrant that our services will run without connection disruptions or data glitches during maintenance operations.
            </p>
            <p style={S.p}>
              We reserve the right to limit API usage or throttle channels during peak traffic periods to protect server resources. For hosting info, refer to the <a href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer" style={S.btnLink}>Vercel Deployment Guidelines</a>.
            </p>
          </section>

          {/* SECTION 4 */}
          <section id="terms-glossary">
            <h2 style={S.h2}>4. What are the Service Glossary Definitions?</h2>
            <div style={S.answerSummary}>
              We define terms like acceptable use, API keys, and database hosting to clarify our user agreements.
            </div>
            <p style={S.p}>
              Our terms rely on specific legal definitions. Review our glossary below:
            </p>

            <h3 style={S.h3}>Terms Glossary</h3>
            <dl style={S.dl}>
              <dt>Acceptable Use Policies</dt>
              <dd>The collection of behavior guidelines that users must follow to keep their accounts active.</dd>

              <dt>API Integration Key</dt>
              <dd>The cryptographic key used to authorize webhook updates from third-party services.</dd>

              <dt>Enterprise Service Level Agreement (SLA)</dt>
              <dd>The custom contract guaranteeing uptime targets and direct support responses for business teams.</dd>
            </dl>
          </section>

          {/* SECTION 5 */}
          <section id="terms-faq">
            <h2 style={S.h2}>5. Frequently Asked Questions about our Terms</h2>
            <div style={S.answerSummary}>
              Review our terms FAQ to learn about username guidelines, database limitations, and dispute resolution.
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
              <li><strong>Safe Workspace in 2026:</strong> You agree to utilize Ekam channels solely for legitimate team collaborations.</li>
              <li><strong>Account Ownership:</strong> You are responsible for protecting your Supabase login details and API credentials.</li>
              <li><strong>Liability Limits:</strong> Ekam is provided without implied warranties, except as defined in Enterprise SLAs.</li>
              <li><strong>Right of Termination:</strong> We reserve the right to shut down workspaces that violate our usage terms.</li>
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
export default TermsPage;
