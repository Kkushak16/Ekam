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
      gap: 16,
      position: 'relative'
    },
    cardFeatured: {
      background: 'rgba(77, 142, 255, 0.03)',
      border: '1px solid rgba(77, 142, 255, 0.25)',
      borderRadius: 24,
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      position: 'relative',
      boxShadow: '0 10px 30px rgba(77, 142, 255, 0.05)'
    },
    badge: {
      position: 'absolute',
      top: 16,
      right: 16,
      background: '#4d8eff',
      color: '#00285d',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: 10,
      fontWeight: 700,
      textTransform: 'uppercase'
    },
    title: {
      fontSize: 20,
      fontWeight: 700,
      color: '#e2e2e2',
      margin: 0
    },
    price: {
      fontSize: 36,
      fontWeight: 800,
      color: '#e2e2e2',
      margin: '8px 0'
    },
    priceSub: {
      fontSize: 12,
      color: 'rgba(194,198,214,0.4)',
      fontWeight: 'normal'
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontSize: 14,
      flex: 1
    },
    listItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'rgba(194, 198, 214, 0.7)'
    },
    btn: {
      background: 'rgba(255, 255, 255, 0.03)',
      color: '#e2e2e2',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '12px 24px',
      borderRadius: 12,
      fontWeight: 600,
      cursor: 'pointer',
      textAlign: 'center' as const,
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    },
    btnFeatured: {
      background: '#4d8eff',
      color: '#00285d',
      border: 'none',
      padding: '12px 24px',
      borderRadius: 12,
      fontWeight: 700,
      cursor: 'pointer',
      textAlign: 'center' as const,
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      boxShadow: '0 4px 12px rgba(77, 142, 255, 0.2)'
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
      question: "What plans does Ekam offer in 2026?",
      answer: "Ekam offers three main pricing plans: a Free Plan ($0/month) for small teams, a Pro Developer Plan ($9/month) for growing setups needing unlimited history, and a custom Enterprise tier for self-hosting setups and isolated database configurations."
    },
    {
      question: "How do database configurations differ between plans?",
      answer: "Free and Pro plans run on shared infrastructure using our optimized PostgreSQL and MongoDB cluster routing. Enterprise plans offer dedicated cluster isolation, ensuring absolute compliance with security policies and custom backup routines."
    },
    {
      question: "Is there a free trial for the Pro Developer plan?",
      answer: "Yes, you can register and run a 14-day evaluation trial of our Pro Developer Plan without supplying payment credentials, giving you complete access to advanced channel controls and archive records."
    },
    {
      question: "Can we transfer licenses or cancel subscriptions at any time?",
      answer: "Subscriptions are billed on a monthly cycle. You can upgrade, downgrade, or cancel your active plan at any point in time directly through the Settings page interface without experiencing connection locks."
    },
    {
      question: "Does Ekam charge for external webhook triggers?",
      answer: "No, webhook API integrations are fully covered in all active subscriptions. Free accounts have soft limitations of 1,000 requests per day, while Pro and Enterprise profiles feature unlimited inbound and outbound connections."
    },
    {
      question: "Are self-hosted options available for government teams?",
      answer: "Yes. Our Enterprise tier offers on-premises Docker deployment scripts. This isolates all message data inside your private VPC database networks, ensuring compliance with strict compliance standards."
    },
    {
      question: "How does billing work for inactive team members?",
      answer: "Ekam charges only for active registered users who log in and exchange messages during the active billing month, saving substantial operational budget for fluctuating organization sizes."
    },
    {
      question: "Which compliance certifications does Ekam support?",
      answer: "Ekam aligns with GDPR data erasure laws, uses SHA-256 for password credentials hash parameters, and supports TLS 1.3 socket paths. We run regular independent external security code audits."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Ekam Pricing: Affordable Secure Chat Workspace Plans"
        description="Select from Free, Developer, and Custom Enterprise tiers for secure real-time messaging, PostgreSQL database integrations, and SLA guarantees in 2026."
        canonical="https://ekam-woad.vercel.app/pricing"
        pageType="product"
        price="9.00"
        priceCurrency="USD"
        breadcrumbs={[
          { name: "Home", item: "https://ekam-woad.vercel.app/" },
          { name: "Pricing", item: "https://ekam-woad.vercel.app/pricing" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>Ekam Pricing: Affordable Secure Chat Workspace Plans</h1>
        <p style={S.intro}>
          Explore our simple, developer-friendly pricing options. Whether you are launching a private group chat or scaling enterprise-wide database pipelines, we offer transparent billing models for every workload size in 2026.
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#plans-overview" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('plans-overview')?.scrollIntoView({ behavior: 'smooth' }); }}>1. What Plans are Available in the Ekam Suite?</a></li>
          <li><a href="#plan-comparison" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('plan-comparison')?.scrollIntoView({ behavior: 'smooth' }); }}>2. How Do Tiers Compare in Performance and Features?</a></li>
          <li><a href="#enterprise-hosting" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('enterprise-hosting')?.scrollIntoView({ behavior: 'smooth' }); }}>3. Why Choose Ekam Enterprise Self-Hosting Options?</a></li>
          <li><a href="#billing-terms" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('billing-terms')?.scrollIntoView({ behavior: 'smooth' }); }}>4. What are the Billing Terms and Glossary Details?</a></li>
          <li><a href="#pricing-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('pricing-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>5. Frequently Asked Questions about Ekam Billing</a></li>
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
              <div style={S.cardFeatured}>
                <span style={S.badge}>Popular</span>
                <h3 style={S.title}>Pro Developer</h3>
                <div style={S.price}>$9<span style={S.priceSub}>/user/month</span></div>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(194,198,214,0.5)' }}>Best for startups requiring full message history and admin roles.</p>
                <ul style={S.list}>
                  <li style={S.listItem}><span>✔</span> Unlimited active rooms</li>
                  <li style={S.listItem}><span>✔</span> Infinite message archives</li>
                  <li style={S.listItem}><span>✔</span> Secure SSE fallback pipeline</li>
                  <li style={S.listItem}><span>✔</span> Priority developer support</li>
                </ul>
                <a href="/login" style={S.btnFeatured}>Go Pro Now</a>
              </div>

              {/* Enterprise Card */}
              <div style={S.card}>
                <h3 style={S.title}>Enterprise</h3>
                <div style={S.price}>Custom</div>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(194,198,214,0.5)' }}>Tailored for on-prem self-hosting, compliance audits, and SLA guarantees.</p>
                <ul style={S.list}>
                  <li style={S.listItem}><span>✔</span> On-Premises Docker setups</li>
                  <li style={S.listItem}><span>✔</span> Dedicated isolated databases</li>
                  <li style={S.listItem}><span>✔</span> Custom SSO / SAML routing</li>
                  <li style={S.listItem}><span>✔</span> 99.99% SLA uptime guarantee</li>
                </ul>
                <a href="/contact" style={S.btn}>Contact Sales</a>
              </div>
            </div>
          </section>

          {/* SECTION 2 */}
          <section id="plan-comparison">
            <h2 style={S.h2}>2. How Do Tiers Compare in Performance and Features?</h2>
            <div style={S.answerSummary}>
              Higher tiers offer isolated databases, dedicated socket channels, and infinite message archiving with zero rate limiting.
            </div>
            <p style={S.p}>
              We run all real-time pipelines on high-capacity virtual networks. To ensure maximum server-side performance, resource limits are dynamically updated depending on your team's plan tier. Pro and Enterprise memberships benefit from dedicated database connection pools, maintaining fast message delivery under high load.
            </p>
            <p style={S.p}>
              Below is a detailed comparison of our service limits and database structures:
            </p>

            <table style={S.table}>
              <caption>Tier Feature &amp; Performance Matrix</caption>
              <thead>
                <tr>
                  <th style={S.th}>Feature Item</th>
                  <th style={S.th}>Free Tier</th>
                  <th style={S.th}>Pro Developer</th>
                  <th style={S.th}>Enterprise Tier</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={S.td}>Active Channels Limit</td>
                  <td style={S.td}>10 Rooms max</td>
                  <td style={S.td}>Unlimited Rooms</td>
                  <td style={S.td}>Unlimited Rooms</td>
                </tr>
                <tr>
                  <td style={S.td}>Data Storage</td>
                  <td style={S.td}>Shared Clusters</td>
                  <td style={S.td}>Dedicated Pools</td>
                  <td style={S.td}>Isolated On-Prem / VPC</td>
                </tr>
                <tr>
                  <td style={S.td}>Socket Fallbacks</td>
                  <td style={S.td}>HTTP Polling only</td>
                  <td style={S.td}>Socket.IO &amp; SSE fallbacks</td>
                  <td style={S.td}>Custom Multipath routes</td>
                </tr>
                <tr>
                  <td style={S.td}>Uptime SLA</td>
                  <td style={S.td}>Best Effort</td>
                  <td style={S.td}>99.9% Uptime</td>
                  <td style={S.td}>99.99% SLA Guarantee</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* SECTION 3 */}
          <section id="enterprise-hosting">
            <h2 style={S.h2}>3. Why Choose Ekam Enterprise Self-Hosting Options?</h2>
            <div style={S.answerSummary}>
              Self-hosting keeps all conversations within your corporate firewall, supporting custom PostgreSQL and MongoDB cluster configurations.
            </div>
            <p style={S.p}>
              For organizations with strict security requirements, our Enterprise self-hosting package enables deployment on private VPCs. This setup lets you run Ekam via Docker, isolating all database reads and user histories behind your private firewalls.
            </p>
            <p style={S.p}>
              Our setups integrate directly with identity providers (such as Okta, Azure AD, or custom SAML 2.0 servers), allowing security teams to manage access rights globally. For details, contact our engineering team via the <a href="/contact" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('app-navigate', { detail: 'contact' })); }} style={S.btnLink}>Ekam Contact Support page</a>.
            </p>
          </section>

          {/* SECTION 4 */}
          <section id="billing-terms">
            <h2 style={S.h2}>4. What are the Billing Terms and Glossary Details?</h2>
            <div style={S.answerSummary}>
              Ekam uses transparent user-based billing structures, pro-rating inactive users on your monthly invoice.
            </div>
            <p style={S.p}>
              To help teams estimate their costs, we maintain a clear glossary of our billing terms. We avoid hidden API fees or connection-based surcharges.
            </p>

            <h3 style={S.h3}>Billing Glossary</h3>
            <dl style={S.dl}>
              <dt>Active User Account</dt>
              <dd>Any user profile that accesses the chat interface or transmits messages during the active monthly billing cycle.</dd>

              <dt>Message Archive History</dt>
              <dd>The storage duration for your chat records in MongoDB. Free accounts retain archives for 7 days; Pro and Enterprise tiers feature permanent storage.</dd>

              <dt>SLA Uptime Guarantee</dt>
              <dd>Our commitment to platform availability. If downtime falls below our SLA targets, we issue service credits based on our service terms.</dd>
            </dl>
          </section>

          {/* SECTION 5 */}
          <section id="pricing-faq">
            <h2 style={S.h2}>5. Frequently Asked Questions about Ekam Billing</h2>
            <div style={S.answerSummary}>
              Read through our billing FAQ to learn about payment integrations, self-hosting, and subscription upgrades.
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
              <li><strong>Zero Rate Limits:</strong> Pro and Enterprise users benefit from dedicated database connection pools.</li>
              <li><strong>Complete Control:</strong> Manage channels, add moderators, or cancel plans directly through your settings panel.</li>
              <li><strong>On-Premises Security:</strong> Enterprise accounts can deploy Ekam locally via Docker for absolute data isolation.</li>
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
export default PricingPage;
