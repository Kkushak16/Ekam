import React, { useState } from 'react';
import SEOMeta from '../components/SEOMeta';

export function PricingPage() {
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
    title: {
      fontSize: 20,
      fontWeight: 700,
      color: '#adc6ff',
      margin: 0
    },
    price: {
      fontSize: 36,
      fontWeight: 800,
      color: '#e2e2e2',
      display: 'flex',
      alignItems: 'baseline',
      gap: 4
    },
    priceSub: {
      fontSize: 14,
      fontWeight: 500,
      color: 'rgba(194, 198, 214, 0.5)'
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    },
    listItem: {
      fontSize: 14,
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      color: 'rgba(194, 198, 214, 0.7)'
    },
    btn: {
      background: 'rgba(255, 255, 255, 0.03)',
      color: '#e2e2e2',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '12px 24px',
      borderRadius: 12,
      textAlign: 'center',
      textDecoration: 'none',
      fontSize: 14,
      fontWeight: 600,
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    btnPrimary: {
      background: '#4d8eff',
      color: '#00285d',
      border: 'none',
      padding: '12px 24px',
      borderRadius: 12,
      textAlign: 'center',
      textDecoration: 'none',
      fontSize: 14,
      fontWeight: 700,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(77, 142, 255, 0.25)'
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
      question: "What plans does Ekam offer in 2026?",
      answer: "Ekam offers a Free Tier ($0), a Pro Developer plan ($9 per user monthly), and a custom Enterprise option with localized support metrics."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can easily downgrade your workspace to the Free Tier. When you cancel, your Pro features continue running until the end of the current billing month."
    },
    {
      question: "Are there any hidden database storage costs?",
      answer: "No. Our plans contain explicit MongoDB and PostgreSQL memory limits. If your workspace exceeds these capacities, we alert you to archive old logs before applying restrictions."
    },
    {
      question: "Which compliance certifications does Ekam support?",
      answer: "Ekam aligns with GDPR data erasure laws, uses bcryptjs for password credentials hash parameters, and supports TLS 1.3 socket paths. We run regular independent external security code audits."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Ekam Pricing: Affordable Secure Chat Workspace Plans"
        description="Select from Free, Developer, and Custom Enterprise tiers for secure real-time messaging, PostgreSQL database integrations, and SLA guarantees in 2026."
        canonical="https://ekam-woad.vercel.app/pricing"
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
          { name: "Pricing", item: "https://ekam-woad.vercel.app/pricing" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>Ekam Pricing: Affordable Secure Chat Workspace Plans</h1>
        <p style={S.intro}>
          Explore our simple, developer-friendly pricing options. Whether you are launching a private group chat or scaling enterprise-wide database pipelines, we offer transparent billing models for every workload size in <time datetime="2026">2026</time>.
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#plans-overview" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('plans-overview')?.scrollIntoView({ behavior: 'smooth' }); }}>1. What Plans are Available in the Ekam Suite?</a></li>
          <li><a href="#plan-comparison" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('plan-comparison')?.scrollIntoView({ behavior: 'smooth' }); }}>2. How Do Tiers Compare in Performance and Features?</a></li>
          <li><a href="#enterprise-hosting" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('enterprise-hosting')?.scrollIntoView({ behavior: 'smooth' }); }}>3. Why Choose Ekam Enterprise Self-Hosting Options?</a></li>
          <li><a href="#purchase-steps" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('purchase-steps')?.scrollIntoView({ behavior: 'smooth' }); }}>4. How Can You Upgrade Your Workspace in Four Steps?</a></li>
          <li><a href="#billing-terms" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('billing-terms')?.scrollIntoView({ behavior: 'smooth' }); }}>5. What are the Billing Terms and Glossary Details?</a></li>
          <li><a href="#pricing-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('pricing-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>6. Frequently Asked Questions about Ekam Billing</a></li>
        </ul>
      </nav>

      <main id="main-content">
        <article>

          {/* SECTION 1 */}
          <section id="plans-overview">
            <h2 style={S.h2}>1. What Plans are Available in the Ekam Suite?</h2>
            <div style={S.answerSummary}>
              Ekam offers three main pricing plans: Free ($0), Pro Developer ($9/user/month), and a custom Enterprise tier to cover diverse team requirements.
            </div>
            <p style={S.p}>
              We designed Ekam's pricing structures to scale with your team's real-time messaging needs. Small developer projects can begin with our Free plan, utilizing up to ten channels. For team collaborations needing permanent logging, the Pro tier introduces infinite message retention and priority API response handshakes.
            </p>
            <p style={S.p}>
              All transactions are secured by TLS 1.3 socket paths. We enforce clear billing practices, letting you manage users directly through our frontend interface. Refer to the <a href="https://stripe.com/docs" target="_blank" rel="noopener noreferrer" style={S.btnLink}>Stripe billing documentation</a> for card integration details.
            </p>

            {/* Pricing Grid */}
            <div style={S.grid}>
              {/* Free Card */}
              <div style={S.card}>
                <h3 style={S.title}>Free Plan</h3>
                <div style={S.price}>$0<span style={S.priceSub}>/month</span></div>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(194,198,214,0.5)' }}>Perfect for small teams launching secure group chat pipelines.</p>
                <ul style={S.list}>
                  <li style={S.listItem}><span>✔</span> Up to 10 active rooms</li>
                  <li style={S.listItem}><span>✔</span> Sub-50ms message delivery</li>
                  <li style={S.listItem}><span>✔</span> Basic moderation tools</li>
                  <li style={S.listItem}><span>✔</span> 7-day archive history</li>
                </ul>
                <a href="/login" style={S.btn}>Get Started</a>
              </div>

              {/* Pro Card */}
              <div style={{ ...S.card, border: '1px solid rgba(77, 142, 255, 0.3)', background: 'rgba(77, 142, 255, 0.02)' }}>
                <h3 style={S.title}>Pro Developer</h3>
                <div style={S.price}>$9<span style={S.priceSub}>/user /month</span></div>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(194,198,214,0.5)' }}>Ideal for professional teams requiring persistent records and integrations.</p>
                <ul style={S.list}>
                  <li style={S.listItem}><span>✔</span> Unlimited public &amp; private rooms</li>
                  <li style={S.listItem}><span>✔</span> Permanent chat logging history</li>
                  <li style={S.listItem}><span>✔</span> Advanced room ownership &amp; transfers</li>
                  <li style={S.listItem}><span>✔</span> 99.9% API SLA guarantee</li>
                </ul>
                <a href="/login" style={S.btnPrimary}>Upgrade Now</a>
              </div>

              {/* Enterprise Card */}
              <div style={S.card}>
                <h3 style={S.title}>Enterprise</h3>
                <div style={S.price}>Custom</div>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(194,198,214,0.5)' }}>Tailored specs for compliance-first corporations.</p>
                <ul style={S.list}>
                  <li style={S.listItem}><span>✔</span> Self-hosted private Docker scripts</li>
                  <li style={S.listItem}><span>✔</span> Custom MongoDB clusters inside your VPC</li>
                  <li style={S.listItem}><span>✔</span> 24/7 dedicated engineering support</li>
                  <li style={S.listItem}><span>✔</span> HIPAA &amp; SOC2 compliance setups</li>
                </ul>
                <a href="/contact" style={S.btn}>Contact Sales</a>
              </div>
            </div>

            <h3 style={S.h3}>1.1 Is There a Setup Fee for Launching Spaces?</h3>
            <p style={S.p}>
              No setup fees are applied. We prioritize transparent billing models with no hidden service surcharges.
            </p>

            <h3 style={S.h3}>1.2 Are Non-Profit Discounts Available?</h3>
            <p style={S.p}>
              We offer significant pricing accommodations for academic organizations and verified non-profit groups.
            </p>
          </section>

          {/* SECTION 2 */}
          <section id="plan-comparison">
            <h2 style={S.h2}>2. How Do Tiers Compare in Performance and Features?</h2>
            <div style={S.answerSummary}>
              Ekam tiers scale from basic websocket delivery to full Docker orchestration for private-network isolation.
            </div>
            <p style={S.p}>
              Ekam ensures fast response times across all accounts. Review our detailed feature comparison table below to identify the appropriate tier for your development team:
            </p>

            <table style={S.table}>
              <caption>Plan Feature Matrix comparison</caption>
              <thead>
                <tr>
                  <th style={S.th}>Feature Item</th>
                  <th style={S.th}>Free Tier</th>
                  <th style={S.th}>Pro Developer</th>
                  <th style={S.th}>Enterprise Custom</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>Active Channels Limit</td>
                  <td style={S.td}>10 Rooms</td>
                  <td style={S.td}>Unlimited</td>
                  <td style={S.td}>Unlimited</td>
                </tr>
                <tr>
                  <td style={S.td}>Log Retention Duration</td>
                  <td style={S.td}>7 Days</td>
                  <td style={S.td}>Infinite Archive</td>
                  <td style={S.td}>Infinite Archive</td>
                </tr>
                <tr>
                  <td style={S.td}>Database Cluster Host</td>
                  <td style={S.td}>Shared Instance</td>
                  <td style={S.td}>Shared Instance</td>
                  <td style={S.td}>Isolated Private VPC</td>
                </tr>
                <tr>
                  <td style={S.td}>WebSocket Handshake Rate</td>
                  <td style={S.td}>Standard priority</td>
                  <td style={S.td}>High priority</td>
                  <td style={S.td}>Isolated routing</td>
                </tr>
              </tbody>
            </table>

            <h3 style={S.h3}>2.1 How Does Shared Clustering Impact Latency?</h3>
            <p style={S.p}>
              Our shared clusters leverage Redis-based caching to prevent performance drops during high traffic.
            </p>

            <h3 style={S.h3}>2.2 Can You Run Private Databases Locally?</h3>
            <p style={S.p}>
              Yes. Enterprise clients can configure isolated local MongoDB containers to secure conversational histories within their local intranet.
            </p>
          </section>

          {/* SECTION 3 */}
          <section id="enterprise-hosting">
            <h2 style={S.h2}>3. Why Choose Ekam Enterprise Self-Hosting Options?</h2>
            <div style={S.answerSummary}>
              Ekam Enterprise gives organizations total database control, letting them self-host systems and isolate chat logs from shared cloud servers.
            </div>
            <p style={S.p}>
              Compliance teams require total isolation for corporate messages. While our cloud services are fully encrypted, enterprise deployment pipelines allow you to host the backend within private VPC walls. This avoids sharing databases with other organizations, removing common interception surfaces.
            </p>
            <blockquote style={S.blockquote}>
              "Based on our implementation experience, large teams deploying local PostgreSQL tables achieve a 20% reduction in database read durations compared to remote clouds." – Kushak, Developer
            </blockquote>
            <p style={S.p}>
              We recommend analyzing compliance guidelines early. You should consider self-hosting if your team is bound by strict GDPR data-localization regulations.
            </p>

            <h3 style={S.h3}>3.1 What are the Technical Self-Hosting Requirements?</h3>
            <p style={S.p}>
              Self-hosting requires Kubernetes or Docker environments, a running PostgreSQL instance, and a MongoDB cluster configured for replica sets.
            </p>

            <h3 style={S.h3}>3.2 What are the Alternatives to Self-Hosting?</h3>
            <p style={S.p}>
              An alternative approach is utilizing our managed Enterprise cloud. We isolate your schemas in dedicated database containers, balancing security with zero setup overhead.
            </p>
          </section>

          {/* SECTION 4 - STEP-BY-STEP */}
          <section id="purchase-steps">
            <h2 style={S.h2}>4. How Can You Upgrade Your Workspace in Four Steps?</h2>
            <div style={S.answerSummary}>
              Upgrade your Ekam workspace in four steps: registering accounts, accessing billing dashboards, choosing tiers, and verifying checkouts.
            </div>
            <p style={S.p}>
              If you want to transition your workspace from Free to Pro Developer, follow this ordered instructional checklist:
            </p>

            <ol style={S.ol}>
              <li style={S.li}>
                <strong>Register:</strong> Create or log in to your active account using your credentials on our secure sign-in panel.
              </li>
              <li style={S.li}>
                <strong>Navigate:</strong> Access the user billing panel located under your personal settings menu.
              </li>
              <li style={S.li}>
                <strong>Select:</strong> Choose the Pro Developer plan and map your payment parameters via Stripe.
              </li>
              <li style={S.li}>
                <strong>Verify:</strong> Confirm that your workspace updates immediately to display the "Pro Developer" badge.
              </li>
            </ol>
          </section>

          {/* SECTION 5 */}
          <section id="billing-terms">
            <h2 style={S.h2}>5. What are the Billing Terms and Glossary Details?</h2>
            <div style={S.answerSummary}>
              Review our terminology definitions regarding billing cycles, SLA agreements, and user seat limits.
            </div>
            <p style={S.p}>
              Clear definitions are critical to managing cloud budgets. We define our billing terms below:
            </p>

            <h3 style={S.h3}>Billing Glossary</h3>
            <dl style={S.dl}>
              <dt>SLA (Service Level Agreement)</dt>
              <dd>Our commitment to keeping APIs operational. Pro and Enterprise tiers carry a guaranteed 99.9% uptime target.</dd>

              <dt>User Seat</dt>
              <dd>An active user slot in your workspace. We bill monthly based on the total count of registered accounts in your workspace.</dd>

              <dt>Data Isolation</dt>
              <dd>The structural segregation of database records to ensure that distinct workspaces do not share active memory processes.</dd>
            </dl>
          </section>

          {/* SECTION 6 */}
          <section id="pricing-faq">
            <h2 style={S.h2}>6. Frequently Asked Questions about Ekam Billing</h2>
            <div style={S.answerSummary}>
              Explore our FAQ directory for quick answers about cards, downgrades, logs, and database security.
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
              <li><strong>Simple Billing in 2026:</strong> Pro Developer pricing is set at $9/user/month with no setup fees.</li>
              <li><strong>Guaranteed SLA:</strong> Enjoy a 99.9% API uptime target with priority developer support.</li>
              <li><strong>Compliance Readiness:</strong> Select from cloud isolation or private Docker configurations to meet local rules.</li>
              <li><strong>Zero Down-Time Upgrades:</strong> Modify plans on the fly without database connection dropouts.</li>
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
export default PricingPage;
