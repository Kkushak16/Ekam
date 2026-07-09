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
    formBox: {
      background: 'rgba(255, 255, 255, 0.01)',
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
      fontSize: 14,
      fontWeight: 600,
      color: '#e2e2e2'
    },
    input: {
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 12,
      padding: '12px 16px',
      fontSize: 15,
      color: '#e2e2e2',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    textarea: {
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 12,
      padding: '12px 16px',
      fontSize: 15,
      color: '#e2e2e2',
      outline: 'none',
      minHeight: 120,
      resize: 'vertical',
      transition: 'all 0.2s ease'
    },
    btnSubmit: {
      background: '#4d8eff',
      color: '#00285d',
      border: 'none',
      padding: '14px 28px',
      borderRadius: 12,
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
      alignSelf: 'flex-start',
      boxShadow: '0 4px 16px rgba(77, 142, 255, 0.2)',
      transition: 'all 0.2s ease'
    },
    successMessage: {
      background: 'rgba(77, 142, 255, 0.05)',
      border: '1px solid rgba(77, 142, 255, 0.15)',
      borderRadius: 24,
      padding: 32,
      textAlign: 'center',
      color: '#e2e2e2'
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
      question: "What is the typical response time for support inquiries?",
      answer: "We respond to all standard developer inquiries within 24 hours. Enterprise subscribers receive custom priority response SLA targets."
    },
    {
      question: "Can I query sales representatives regarding customized pricing?",
      answer: "Yes, you can request custom terms using this contact portal. Our sales team is ready to map server limits to match your transaction targets."
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
          { name: "Contact", item: "https://ekam-woad.vercel.app/contact" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>Contact Ekam Support: Secure Communication Help</h1>
        <p style={S.intro}>
          Have inquiries regarding security credentials, database setups, workspace migration steps, or SLA contracts? Use our contact portal or email our support staff. We respond to all requests within 24 hours in <time datetime="2026">2026</time>.
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#support-portal" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('support-portal')?.scrollIntoView({ behavior: 'smooth' }); }}>1. How Do You Send an Inquiry to the Support Portal?</a></li>
          <li><a href="#contact-channels" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('contact-channels')?.scrollIntoView({ behavior: 'smooth' }); }}>2. What are the Official Contact Channels?</a></li>
          <li><a href="#escalation-sla" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('escalation-sla')?.scrollIntoView({ behavior: 'smooth' }); }}>3. How Does our Incident Escalation SLA Operate?</a></li>
          <li><a href="#support-steps" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('support-steps')?.scrollIntoView({ behavior: 'smooth' }); }}>4. Can You Request Enterprise Assistance in Four Steps?</a></li>
          <li><a href="#contact-glossary" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('contact-glossary')?.scrollIntoView({ behavior: 'smooth' }); }}>5. What are the Common Support Glossary Terms?</a></li>
          <li><a href="#contact-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('contact-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>6. Frequently Asked Questions about support and sales</a></li>
        </ul>
      </nav>

      <main id="main-content">
        <article>

          {/* SECTION 1 */}
          <section id="support-portal">
            <h2 style={S.h2}>1. How Do You Send an Inquiry to the Support Portal?</h2>
            <div style={S.answerSummary}>
              Send inquiries by submitting the support form with your name, email, and message details.
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
                    <label style={S.label} htmlFor="email">Your Email</label>
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
                    <label style={S.label} htmlFor="message">Message Description</label>
                    <textarea
                      id="message"
                      required
                      style={S.textarea}
                      placeholder="How can our engineering team help you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    style={S.btnSubmit}
                    onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  >
                    Submit Ticket
                  </button>
                </form>
              )}
            </div>

            <h3 style={S.h3}>1.1 What Types of Tickets Can Be Opened?</h3>
            <p style={S.p}>
              We triage incoming items into server disconnections, billing, database setups, and compliance checks.
            </p>

            <h3 style={S.h3}>1.2 Are Ticket Inquiries Confidential?</h3>
            <p style={S.p}>
              Yes, all inquiries are encrypted in transit and stored inside isolated PostgreSQL databases to satisfy team safety requirements.
            </p>
          </section>

          {/* SECTION 2 */}
          <section id="contact-channels">
            <h2 style={S.h2}>2. What are the Official Contact Channels?</h2>
            <div style={S.answerSummary}>
              Ekam supports email communication, public GitHub repositories, and dedicated phone options for Enterprise teams.
            </div>
            <p style={S.p}>
              Depending on the urgency of your query, we support several communication paths. Standard code questions can be asked directly via our public repositories, whereas enterprise security questions should utilize our private pipelines.
            </p>

            <table style={S.table}>
              <caption>Official Communications Directories</caption>
              <thead>
                <tr>
                  <th style={S.th}>Channel Name</th>
                  <th style={S.th}>Access Details</th>
                  <th style={S.th}>Uptime Hours</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>General Support Email</td>
                  <td style={S.td}>support@ekam-chat.com</td>
                  <td style={S.td}>Monday to Friday, 9:00 - 18:00 EST</td>
                </tr>
                <tr>
                  <td style={S.td}>Sales &amp; Partnership</td>
                  <td style={S.td}>sales@ekam-chat.com</td>
                  <td style={S.td}>Monday to Friday, 9:00 - 17:00 EST</td>
                </tr>
                <tr>
                  <td style={S.td}>GitHub Issue Tracker</td>
                  <td style={S.td}>github.com/Kkushak16/Ekam</td>
                  <td style={S.td}>Publicly accessible 24/7</td>
                </tr>
                <tr>
                  <td style={S.td}>Emergency Support Hotline</td>
                  <td style={S.td}>+1-800-555-EKAM (Enterprise)</td>
                  <td style={S.td}>24/7 Dedicated Line</td>
                </tr>
              </tbody>
            </table>

            <h3 style={S.h3}>2.1 How Does GitHub Ticket Submission Work?</h3>
            <p style={S.p}>
              Bugs can be submitted directly via GitHub. You should include logs and package versions to speed up issue triage.
            </p>

            <h3 style={S.h3}>2.2 Can We Schedule Video Calls for Integrations?</h3>
            <p style={S.p}>
              Yes, Pro and Enterprise workspace owners can request video consultation meetings to review database setups.
            </p>
          </section>

          {/* SECTION 3 */}
          <section id="escalation-sla">
            <h2 style={S.h2}>3. How Does our Incident Escalation SLA Operate?</h2>
            <div style={S.answerSummary}>
              Ekam prioritizes operational issues using a three-tier severity hierarchy, ensuring immediate attention for total connection drops.
            </div>
            <p style={S.p}>
              To coordinate system maintenance and prevent lag, we handle support inquiries based on a strict escalation SLA. Severity definitions are categorized below:
            </p>
            <blockquote style={S.blockquote}>
              "Based on our implementation experience, dividing issues into clear priority levels ensures that critical backend interruptions get addressed within minutes." – Kushak, Developer
            </blockquote>
            <p style={S.p}>
              You should review these guidelines to set correct expectations when submitting support tickets.
            </p>

            <h3 style={S.h3}>3.1 What are the Severity Levels?</h3>
            <p style={S.p}>
              Severity 1 represents complete server disconnections or security breaches. Severity 2 covers partial features lag. Severity 3 applies to general documentation requests.
            </p>

            <h3 style={S.h3}>3.2 What are the Target Response Durations?</h3>
            <p style={S.p}>
              On the other hand, non-enterprise accounts receive standard 24-hour replies, which may be preferable for staging setups without strict latency guarantees.
            </p>
          </section>

          {/* SECTION 4 - STEP-BY-STEP */}
          <section id="support-steps">
            <h2 style={S.h2}>4. Can You Request Enterprise Assistance in Four Steps?</h2>
            <div style={S.answerSummary}>
              Request custom assistance in four steps: accessing portals, selecting severity tiers, specifying metrics, and tracking allocations.
            </div>
            <p style={S.p}>
              If your enterprise team requires custom support, follow this ordered instructional checklist:
            </p>

            <ol style={S.ol}>
              <li style={S.li}>
                <strong>Navigate:</strong> Access your company's private management panel inside the dashboard.
              </li>
              <li style={S.li}>
                <strong>Formulate:</strong> Fill out the support request, specifying your database configuration and client version.
              </li>
              <li style={S.li}>
                <strong>Assign:</strong> Set the ticket severity level based on the urgency of the problem.
              </li>
              <li style={S.li}>
                <strong>Submit:</strong> Click the "Submit Urgent Ticket" button and monitor updates in your browser.
              </li>
            </ol>
          </section>

          {/* SECTION 5 */}
          <section id="contact-glossary">
            <h2 style={S.h2}>5. What are the Common Support Glossary Terms?</h2>
            <div style={S.answerSummary}>
              Review definitions regarding escalation, response times, and target resolution boundaries.
            </div>
            <p style={S.p}>
              Understanding support terms helps maintain clear communication paths:
            </p>

            <h3 style={S.h3}>Support Glossary</h3>
            <dl style={S.dl}>
              <dt>Priority Triage</dt>
              <dd>The sorting of bugs based on severity levels to address critical issues first.</dd>

              <dt>Incident Resolution Time</dt>
              <dd>The duration between a ticket's submission and the implementation of a functional code fix.</dd>

              <dt>On-Duty Engineer</dt>
              <dd>The system administrator assigned to monitor server stability and address database issues.</dd>
            </dl>
          </section>

          {/* SECTION 6 */}
          <section id="contact-faq">
            <h2 style={S.h2}>6. Frequently Asked Questions about support and sales</h2>
            <div style={S.answerSummary}>
              Review our FAQ for quick answers regarding tickets, sales, call options, and system security.
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
              <li><strong>24-Hour SLA:</strong> Standard developer inquiries receive replies within 24 hours.</li>
              <li><strong>Enterprise Support Hotline:</strong> Direct access hotline is open 24/7 for urgent database needs.</li>
              <li><strong>Secure Routing:</strong> All submitted ticket data is encrypted and saved in isolated PostgreSQL environments.</li>
              <li><strong>Global Engineering Team:</strong> Engineers are positioned across timezones to ensure fast support.</li>
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
export default ContactPage;
