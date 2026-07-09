import React, { useState } from 'react';
import SEOMeta from '../components/SEOMeta';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 40,
      marginTop: 32
    },
    formBox: {
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 24,
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    },
    label: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      color: 'rgba(194, 198, 214, 0.5)'
    },
    input: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '12px 16px',
      color: '#e2e2e2',
      fontSize: 15,
      outline: 'none',
      fontFamily: 'inherit',
      transition: 'border-color 0.2s ease'
    },
    textarea: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      padding: '12px 16px',
      color: '#e2e2e2',
      fontSize: 15,
      outline: 'none',
      fontFamily: 'inherit',
      minHeight: 120,
      resize: 'vertical',
      transition: 'border-color 0.2s ease'
    },
    btnSubmit: {
      background: '#4d8eff',
      color: '#00285d',
      border: 'none',
      borderRadius: 12,
      padding: '14px 24px',
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'center'
    },
    infoBox: {
      display: 'flex',
      flexDirection: 'column',
      gap: 24
    },
    infoCard: {
      background: 'rgba(77, 142, 255, 0.03)',
      border: '1px solid rgba(77, 142, 255, 0.1)',
      borderRadius: 20,
      padding: 24
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: '#e2e2e2',
      marginBottom: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    },
    successMessage: {
      background: 'rgba(173, 198, 255, 0.08)',
      border: '1px solid rgba(173, 198, 255, 0.2)',
      borderRadius: 16,
      padding: 24,
      textAlign: 'center',
      color: '#adc6ff'
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
    }
  };

  const faqData = [
    {
      question: "How do you reach Ekam customer support?",
      answer: "You can submit an support ticket using the contact form on this page or email our staff directly at support@ekam-chat.com. Our typical response latency is under 24 hours."
    },
    {
      question: "Who should submit security disclosures?",
      answer: "Security researchers or customers who identify potential flaws in JWT headers, WebSocket paths, or PostgreSQL profiles should email security@ekam-chat.com directly to initiate a response process."
    },
    {
      question: "Where is the Ekam corporate headquarters located?",
      answer: "Ekam Technologies Inc. is headquartered at 100 Sapphire Way, Suite 400, San Francisco, California, 94105, supporting engineering operations and enterprise sales."
    },
    {
      question: "How are enterprise sales inquiries processed?",
      answer: "Submit your team size, database configuration requirements, and hosting preferences via our web form. A solutions architect will respond with custom pricing models."
    },
    {
      question: "Can you request a private cryptographic review?",
      answer: "Yes, enterprise customers can request audit logs and cryptography reviews of our real-time messaging pipeline. Submit your request using our support contact form."
    },
    {
      question: "What is the average response time for support tickets?",
      answer: "Our support engineers respond to general tickets within 12-24 hours. Enterprise accounts on premium tiers benefit from custom 1-hour SLA response guarantees."
    },
    {
      question: "Does Ekam offer assistance with database migrations?",
      answer: "Yes, our developer support team helps configure local Mongoose drivers, PostgreSQL tables, and environment variables. Refer to the Docs page for details."
    },
    {
      question: "Is there a phone number for emergency support?",
      answer: "Emergency hotline phone support (+1-800-555-EKAM) is available exclusively to Enterprise customers, providing direct access to our on-duty system administrators."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Contact Ekam Support: Secure Communication Help"
        description="Contact Ekam Support. Reach out to our engineering team for deployment help, cryptography audits, and database integration support in 2026."
        canonical="https://ekam-woad.vercel.app/contact"
        pageType="webpage"
        breadcrumbs={[
          { name: "Home", item: "https://ekam-woad.vercel.app/" },
          { name: "Contact", item: "https://ekam-woad.vercel.app/contact" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>Contact Ekam Support: Secure Communication Help</h1>
        <p style={S.intro}>
          Have inquiries regarding security credentials, database setups, workspace migration steps, or SLA contracts? Use our contact portal or email our support staff. We respond to all requests within 24 hours in 2026.
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#support-portal" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('support-portal')?.scrollIntoView({ behavior: 'smooth' }); }}>1. How Do You Send an Inquiry to the Support Portal?</a></li>
          <li><a href="#contact-channels" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('contact-channels')?.scrollIntoView({ behavior: 'smooth' }); }}>2. What are the Official Contact Channels?</a></li>
          <li><a href="#escalation-sla" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('escalation-sla')?.scrollIntoView({ behavior: 'smooth' }); }}>3. How Does our Incident Escalation SLA Operate?</a></li>
          <li><a href="#contact-glossary" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('contact-glossary')?.scrollIntoView({ behavior: 'smooth' }); }}>4. What are the Common Support Glossary Terms?</a></li>
          <li><a href="#contact-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('contact-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>5. Frequently Asked Questions about support and sales</a></li>
        </ul>
      </nav>

      <main id="main-content">
        <article>

          {/* SECTION 1 */}
          <section id="support-portal">
            <h2 style={S.h2}>1. How Do You Send an Inquiry to the Support Portal?</h2>
            <div style={S.answerSummary}>
              Send inquiries by submitting the support form with your name, email, and message.
            </div>
            <p style={S.p}>
              Our contact portal is built to route questions directly to our engineering team. If you are experiencing server connection issues or have questions about self-hosting, fill out the form. Ensure your email address is correct so our response arrives safely.
            </p>

            <div style={{ margin: '32px 0' }}>
              {submitted ? (
                <div style={S.successMessage}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#e2e2e2' }}>Inquiry Submitted</h3>
                  <p style={{ margin: 0 }}>Thank you for reaching out. An engineer will follow up at your provided email address shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={S.formBox} noValidate>
                  <div style={S.fieldGroup}>
                    <label style={S.label} htmlFor="name">Your Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      style={S.input}
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div style={S.fieldGroup}>
                    <label style={S.label} htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      required
                      style={S.input}
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div style={S.fieldGroup}>
                    <label style={S.label} htmlFor="message">How can we help?</label>
                    <textarea
                      id="message"
                      required
                      style={S.textarea}
                      placeholder="Describe your database setup or setup questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" style={S.btnSubmit}>
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* SECTION 2 */}
          <section id="contact-channels">
            <h2 style={S.h2}>2. What are the Official Contact Channels?</h2>
            <div style={S.answerSummary}>
              Official channels include our developer support email, security vulnerability reporting inbox, and San Francisco headquarters.
            </div>
            <p style={S.p}>
              We maintain multiple inboxes to ensure messages reach the correct team. For help with database setups or setups on Vite, use our general support channel. For vulnerabilities or security feedback, contact our cryptographic review staff.
            </p>

            <div style={S.grid}>
              <div style={S.infoCard}>
                <h3 style={S.infoTitle}>General Support</h3>
                <p style={{ margin: 0, fontSize: 14 }}>
                  Developer setups &amp; integration guides:
                  <br />
                  <strong style={{ color: '#adc6ff' }}>support@ekam-chat.com</strong>
                </p>
              </div>

              <div style={S.infoCard}>
                <h3 style={S.infoTitle}>Security Disclosures</h3>
                <p style={{ margin: 0, fontSize: 14 }}>
                  Cryptographic reports &amp; audits:
                  <br />
                  <strong style={{ color: '#adc6ff' }}>security@ekam-chat.com</strong>
                </p>
              </div>

              <div style={S.infoCard}>
                <h3 style={S.infoTitle}>Corporate Office</h3>
                <p style={{ margin: 0, fontSize: 14 }}>
                  Ekam Technologies Inc.
                  <br />
                  100 Sapphire Way, San Francisco, CA 94105
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3 */}
          <section id="escalation-sla">
            <h2 style={S.h2}>3. How Does our Incident Escalation SLA Operate?</h2>
            <div style={S.answerSummary}>
              Our SLA guarantees 1-hour response times for critical network outages and 12-hour resolutions for database connections.
            </div>
            <p style={S.p}>
              We run all support queues through an automated triage pipeline. Incidents are categorized by severity level to resolve connection issues quickly. Enterprise customers have access to a phone hotline (+1-800-555-EKAM) for emergency assistance.
            </p>
            <p style={S.p}>
              To verify our compliance record, security officers can request monthly uptime reports from our compliance division. For details about user terms, consult the <a href="/terms" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'terms' })); }} style={S.btnLink}>Ekam Terms of Service page</a>.
            </p>
          </section>

          {/* SECTION 4 */}
          <section id="contact-glossary">
            <h2 style={S.h2}>4. What are the Common Support Glossary Terms?</h2>
            <div style={S.answerSummary}>
              Our support guidelines utilize terms like severity levels, SLA guarantees, and triage tickets to organize developer help request queues.
            </div>
            <p style={S.p}>
              We maintain a clear glossary to define service levels. Read the definitions below:
            </p>

            <h3 style={S.h3}>Support Glossary</h3>
            <dl style={S.dl}>
              <dt>Severity Level 1 (Critical Outage)</dt>
              <dd>Any database connection failure or network block that prevents users from exchanging real-time chat messages.</dd>

              <dt>SLA Response Window</dt>
              <dd>The maximum time allowed before an engineer claims a ticket and contacts the client administration team.</dd>

              <dt>Triage Ticket</dt>
              <dd>The support record created when you submit our contact form, containing diagnostic data for our engineering team.</dd>
            </dl>
          </section>

          {/* SECTION 5 */}
          <section id="contact-faq">
            <h2 style={S.h2}>5. Frequently Asked Questions about support and sales</h2>
            <div style={S.answerSummary}>
              Browse through our support FAQ directory to find details about response latency, emergency assistance, and databases.
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
              <li><strong>Help in 2026:</strong> Send questions using our secure support portal for quick engineering feedback.</li>
              <li><strong>Emergency Contact:</strong> Enterprise members have a direct support hotline for quick outage resolutions.</li>
              <li><strong>Clear Escalation:</strong> Support tickets are routed automatically using clear SLA parameters.</li>
              <li><strong>Security Disclosures:</strong> Email security@ekam-chat.com to report cryptographic or system vulnerabilities.</li>
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
export default ContactPage;
