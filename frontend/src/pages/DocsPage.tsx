import React, { useState } from 'react';
import SEOMeta from '../components/SEOMeta';

export function DocsPage() {
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
    pre: {
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      padding: '20px',
      overflowX: 'auto',
      marginBottom: 20
    },
    code: {
      fontFamily: 'Courier New, Courier, monospace',
      fontSize: 14,
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

  const stepsData = [
    { name: "Install Dependencies", text: "Run 'npm install' at the project root." },
    { name: "Setup Credentials", text: "Establish environment settings inside your .env configuration file." },
    { name: "Initialize Tables", text: "Execute migrations inside Supabase database settings." },
    { name: "Launch Stack", text: "Start local servers using the 'npm run dev' terminal task." }
  ];

  const faqData = [
    {
      question: "Which database system handles account credential settings?",
      answer: "Supabase PostgreSQL manages user identity records, password hash credentials, and active channel settings."
    },
    {
      question: "What logs are saved in MongoDB collections?",
      answer: "MongoDB stores text chat messages, room identifiers, author records, and timestamp indexes, optimizing fast query reads and writes for conversational feeds."
    },
    {
      question: "Is it possible to disable SSL verification in local environments?",
      answer: "Yes, you can set `NODE_TLS_REJECT_UNAUTHORIZED=0` inside local env files for testing, but this parameter should be deleted on production deployments to prevent vulnerability risks."
    }
  ];

  return (
    <div style={S.container}>
      <SEOMeta
        title="Ekam Documentation: Developer Setup &amp; API Guides"
        description="Access official developer setup guides for Ekam Chat Platform. Configure Postgres migrations, MongoDB connections, and real-time Socket.io servers in 2026."
        canonical="https://ekam-woad.vercel.app/docs"
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
          { name: "Docs", item: "https://ekam-woad.vercel.app/docs" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>Ekam Documentation: Developer Setup &amp; API Guides</h1>
        <p style={S.intro}>
          Welcome to the official developer reference manual. This walkthrough provides installation commands, database configurations, and environment setups to deploy Ekam on local and staging systems in <time datetime="2026">2026</time>.
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Page Table of Contents" style={S.tocBox}>
        <div style={S.tocTitle}>Table of Contents</div>
        <ul style={S.tocList}>
          <li><a href="#quick-start" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('quick-start')?.scrollIntoView({ behavior: 'smooth' }); }}>1. How Do You Install Ekam Chat Locally?</a></li>
          <li><a href="#db-schema" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('db-schema')?.scrollIntoView({ behavior: 'smooth' }); }}>2. How Do You Configure the Database Schemas?</a></li>
          <li><a href="#running-dev" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('running-dev')?.scrollIntoView({ behavior: 'smooth' }); }}>3. How Do You Run the Local Developer Servers?</a></li>
          <li><a href="#api-terms" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('api-terms')?.scrollIntoView({ behavior: 'smooth' }); }}>4. What are the API Definitions and Terms?</a></li>
          <li><a href="#docs-faq" style={S.tocLink} onClick={(e) => { e.preventDefault(); document.getElementById('docs-faq')?.scrollIntoView({ behavior: 'smooth' }); }}>5. Frequently Asked Questions about Developer Setup</a></li>
        </ul>
      </nav>

      <main id="main-content">
        <article>

          {/* SECTION 1 */}
          <section id="quick-start">
            <h2 style={S.h2}>1. How Do You Install Ekam Chat Locally?</h2>
            <div style={S.answerSummary}>
              Install Ekam locally by cloning the codebase and running npm install within the root directory and frontend subdirectories.
            </div>
            <p style={S.p}>
              Before launching the setup scripts, verify that you have Node.js (version 18.0.0 or higher) and npm installed. Open your command shell, navigate into the project root directory, and fetch the package dependencies:
            </p>

            <pre style={S.pre}>
              <code style={S.code}>
                # Step 1: Install root backend dependencies{'\n'}
                npm install{'\n\n'}
                # Step 2: Install client workspace components{'\n'}
                cd frontend && npm install
              </code>
            </pre>

            <p style={S.p}>
              This fetches the express middleware, socket connection engines, and frontend styling libraries needed to render components correctly. Review our <a href="https://docs.npmjs.com/" target="_blank" rel="noopener noreferrer" style={S.btnLink}>official npm package documentation</a> if compilation errors emerge.
            </p>

            <h3 style={S.h3}>1.1 What are the Node Version Recommendations?</h3>
            <p style={S.p}>
              We recommend using the latest LTS release of Node.js. Operating older version builds may trigger engine syntax conflicts with our ESM imports.
            </p>

            <h3 style={S.h3}>1.2 Can I Use Alternative Package Managers Like Yarn?</h3>
            <p style={S.p}>
              An alternative approach is using Yarn or pnpm. While both work, npm remains our primary recommendation to maintain lockfile consistency across environments.
            </p>
          </section>

          {/* SECTION 2 */}
          <section id="db-schema">
            <h2 style={S.h2}>2. How Do You Configure the Database Schemas?</h2>
            <div style={S.answerSummary}>
              Configure the databases by linking Supabase PostgreSQL to credentials profiles and mapping MongoDB clusters to chat document schemas.
            </div>
            <p style={S.p}>
              Ekam requires dual credentials keys to run. Relational records use PostgreSQL schemas, while fast messaging outputs rely on MongoDB. Prepare a `.env` file in the project backend directory and supply your connection strings:
            </p>

            <pre style={S.pre}>
              <code style={S.code}>
                PORT=5000{'\n'}
                MONGO_URI=mongodb+srv://&lt;user&gt;:&lt;password&gt;@cluster.mongodb.net/ekam{'\n'}
                SUPABASE_URL=https://&lt;project&gt;.supabase.co{'\n'}
                SUPABASE_KEY=ey...{'\n'}
                JWT_SECRET=supersecretkey
              </code>
            </pre>

            <blockquote style={S.blockquote}>
              "Based on our implementation experience, keeping keys outside code files is a fundamental rule. Never commit local credentials files into public git histories." – Kushak, Developer
            </blockquote>

            <h3 style={S.h3}>2.1 How Do You Setup Supabase Tables?</h3>
            <p style={S.p}>
              Create a `profiles` table to house relational details, mapping usernames to identities. Let security policies block write accesses from unauthenticated API pipelines.
            </p>

            <h3 style={S.h3}>2.2 How Do You Enable MongoDB Indexes?</h3>
            <p style={S.p}>
              Best practice dictates mapping chronological compound indexes to message records. You should configure indexes on both `roomId` and `createdAt` fields to keep chat scroll latencies low.
            </p>
          </section>

          {/* SECTION 3 */}
          <section id="running-dev">
            <h2 style={S.h2}>3. How Do You Run the Local Developer Servers?</h2>
            <div style={S.answerSummary}>
              Run the application locally by starting the backend service on port 5000 and launching the client development hot-reloader.
            </div>
            <p style={S.p}>
              Ekam utilizes concurrent pipelines. To run the full stack, you should follow this ordered instructional checklist:
            </p>

            <ol style={S.ol}>
              <li style={S.li}>
                <strong>Start Backend:</strong> Open a terminal tab and launch the main server stream:
                <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginTop: 8 }}>npm run dev</pre>
              </li>
              <li style={S.li}>
                <strong>Start Frontend:</strong> Open a secondary terminal tab, navigate into the frontend folder, and launch Vite:
                <pre style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginTop: 8 }}>npm run dev</pre>
              </li>
              <li style={S.li}>
                <strong>Verify connection:</strong> Load `http://localhost:5173` in your browser. Open the developer console and check that the WebSocket channel connects to port 5000.
              </li>
            </ol>

            <h3 style={S.h3}>3.1 What Port Allocations Are Used?</h3>
            <p style={S.p}>
              By default, the backend operates on port 5000, while the frontend mounts on port 5173. You can override these port values by specifying custom variables in your environment scripts.
            </p>

            <h3 style={S.h3}>3.2 How Do You Troubleshoot Client Disconnections?</h3>
            <p style={S.p}>
              If disconnections occur, verify that your client environment files are loading. Try clearing browser cache and restart your terminal processes to reload config variables.
            </p>
          </section>

          {/* SECTION 4 */}
          <section id="api-terms">
            <h2 style={S.h2}>4. What are the API Definitions and Terms?</h2>
            <div style={S.answerSummary}>
              Review our terminology glossary detailing endpoints structure, real-time message events, and database actions.
            </div>
            <p style={S.p}>
              We document our REST and WebSocket boundaries below. This helps search crawlers and developer integrations identify API capabilities:
            </p>

            <h3 style={S.h3}>Developer API Glossary</h3>
            <dl style={S.dl}>
              <dt>POST /api/auth/register</dt>
              <dd>Registration endpoint. Maps your user record into Supabase PostgreSQL, saving hashed credentials safely.</dd>

              <dt>POST /api/auth/login</dt>
              <dd>Authentication endpoint. Compares credentials and returns a secure JWT signature to validate client sessions.</dd>

              <dt>socket.emit('message')</dt>
              <dd>WebSocket event handler. Dispatches a message to connected channel members, creating a permanent document record in MongoDB.</dd>
            </dl>

            <h3 style={S.h3}>4.1 How Do You Secure REST Handshakes?</h3>
            <p style={S.p}>
              Every protected route requires an `Authorization: Bearer &lt;token&gt;` request header. The server rejects missing tokens to enforce endpoint security.
            </p>

            <h3 style={S.h3}>4.2 Can I Disable API Routes in Staging?</h3>
            <p style={S.p}>
              This may be preferable when running integration tests on isolated components. You should use mock stores to bypass endpoints during staging runs.
            </p>
          </section>

          {/* SECTION 5 */}
          <section id="docs-faq">
            <h2 style={S.h2}>5. Frequently Asked Questions about Developer Setup</h2>
            <div style={S.answerSummary}>
              Explore our FAQ directory for troubleshooting connection drops, database setups, and environment overrides.
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
              <li><strong>Local Stack Launch:</strong> Run Vite and Express server environments concurrently for real-time development.</li>
              <li><strong>Split DB Setup:</strong> Relational tables mount on Supabase while chat databases link to MongoDB.</li>
              <li><strong>JWT Security:</strong> Enforce authentication by passing signed token signatures inside socket handshakes.</li>
              <li><strong>TLS 1.3 Encryption:</strong> All production data routes through secure HTTPS/WSS protocols.</li>
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
export default DocsPage;
