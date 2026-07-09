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
      fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
      fontSize: 14,
      color: '#adc6ff',
      lineHeight: 1.5
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

  const stepsData = [
    { name: "Install dependencies", text: "Clone the code repository and run npm install in the root folder." },
    { name: "Configure database variables", text: "Inject PostgreSQL and MongoDB connection parameters inside your env file." },
    { name: "Execute migration files", text: "Apply table schema migrations to PostgreSQL using database CLI queries." },
    { name: "Run developer servers", text: "Launch nodemon and Vite in developer mode using npm run dev command." }
  ];

  const faqData = [
    {
      question: "How do you install Ekam Chat Platform dependencies?",
      answer: "Navigate to the root directory in your command terminal and execute `npm install`. Then change directories into the frontend subfolder and run `npm install` once more to resolve client-side libraries."
    },
    {
      question: "What environment variables are required to launch the server?",
      answer: "You must supply `DATABASE_URL` for the PostgreSQL connection pool, `MONGODB_URI` for the message storage database cluster, and a `JWT_SECRET` key string used to sign user session tokens."
    },
    {
      question: "How do you execute PostgreSQL migrations in Ekam?",
      answer: "Database schemas are applied by running the sql scripts located under the migrations directory directly inside your Supabase SQL Editor panel, creating profile and room schemas."
    },
    {
      question: "Why does Ekam require nodemon for backend development?",
      answer: "Nodemon monitors files for updates, reloading the server environment automatically when code changes occur, enabling smooth real-time debugging for developers."
    },
    {
      question: "Can you configure a custom port for the API server?",
      answer: "Yes, you can define the port variable inside your `.env` configuration file (e.g. `PORT=8080`). If undefined, the Node.js Express server defaults to port 5000."
    },
    {
      question: "How does the Socket.IO setup initialize on server startup?",
      answer: "The Socket.IO server binds to the initialized HTTP server instance, utilizing shared authentication middleware to verify user tokens before allowing message streams."
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
        pageType="howto"
        steps={stepsData}
        breadcrumbs={[
          { name: "Home", item: "https://ekam-woad.vercel.app/" },
          { name: "Docs", item: "https://ekam-woad.vercel.app/docs" }
        ]}
        faqList={faqData}
      />

      <header>
        <h1 style={S.h1}>Ekam Documentation: Developer Setup &amp; API Guides</h1>
        <p style={S.intro}>
          Welcome to the official developer reference manual. This walkthrough provides installation commands, database configurations, and environment setups to deploy Ekam on local and staging systems in 2026.
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
                # Step 2: Install client-side frontend dependencies{'\n'}
                cd frontend{'\n'}
                npm install
              </code>
            </pre>

            <p style={S.p}>
              These operations fetch core components including React, Zustand state engines, Socket.IO clients, Express frameworks, and database drivers. Read the official <a href="https://docs.npmjs.com/" target="_blank" rel="noopener noreferrer" style={S.btnLink}>npm documentation guidelines</a> for additional package management tips.
            </p>
          </section>

          {/* SECTION 2 */}
          <section id="db-schema">
            <h2 style={S.h2}>2. How Do You Configure the Database Schemas?</h2>
            <div style={S.answerSummary}>
              Configure the databases by executing SQL schemas inside your Supabase PostgreSQL instance and adding the MongoDB connection URL in the environment configurations.
            </div>
            <p style={S.p}>
              Ekam isolates data structures by separating user attributes from real-time chat histories. Relations like user logins and chat channels are written to PostgreSQL. Dynamic chat feeds are written to MongoDB.
            </p>

            <h3 style={S.h3}>A. Applying PostgreSQL Tables Schema</h3>
            <p style={S.p}>
              Execute the username column and profile migrations located in your project setup files inside the PostgreSQL console:
            </p>

            <pre style={S.pre}>
              <code style={S.code}>
                -- Example Username Migration Code{'\n'}
                ALTER TABLE profiles ADD COLUMN username VARCHAR(255) UNIQUE;{'\n'}
                ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
              </code>
            </pre>

            <h3 style={S.h3}>B. Integrating MongoDB Storage</h3>
            <p style={S.p}>
              Supply the connection string used by Mongoose inside the root `.env` config file:
            </p>

            <pre style={S.pre}>
              <code style={S.code}>
                MONGODB_URI=mongodb://localhost:27017/ekam_db
              </code>
            </pre>
          </section>

          {/* SECTION 3 */}
          <section id="running-dev">
            <h2 style={S.h2}>3. How Do You Run the Local Developer Servers?</h2>
            <div style={S.answerSummary}>
              Run the developer servers by executing npm run dev in both the backend root and frontend folders simultaneously.
            </div>
            <p style={S.p}>
              With your databases running and configuration parameters supplied, start the development build processes. Run these scripts in separate shell windows to maintain clean log streams:
            </p>

            <pre style={S.pre}>
              <code style={S.code}>
                # Console 1: Start backend server via Nodemon{'\n'}
                npm run dev{'\n\n'}
                # Console 2: Launch Vite dev web server{'\n'}
                npm run dev --prefix frontend
              </code>
            </pre>

            <p style={S.p}>
              For production builds, compile and bundle the files. Learn about bundle optimization details by reading the official <a href="https://vite.dev/guide/" target="_blank" rel="noopener noreferrer" style={S.btnLink}>Vite documentation resources</a>.
            </p>
          </section>

          {/* SECTION 4 */}
          <section id="api-terms">
            <h2 style={S.h2}>4. What are the API Definitions and Terms?</h2>
            <div style={S.answerSummary}>
              Ekam defines custom variables and structures to coordinate logins, user searches, and push notification triggers.
            </div>
            <p style={S.p}>
              Our documentation relies on specific developer parameters. Review these core settings in our technical glossary below:
            </p>

            <h3 style={S.h3}>API Glossary</h3>
            <dl style={S.dl}>
              <dt>JWT (JSON Web Token)</dt>
              <dd>A secure, compact claim format used to verify users. Included inside header requests to authorize API actions.</dd>

              <dt>Socket.IO Handshake</dt>
              <dd>The initial exchange that establishes a real-time WebSocket connection between the client browser and the Node.js server.</dd>

              <dt>VAPID Keys</dt>
              <dd>Voluntary Application Server Identification keys. Utilized to authenticate server communication with push notification providers.</dd>
            </dl>
          </section>

          {/* SECTION 5 */}
          <section id="docs-faq">
            <h2 style={S.h2}>5. Frequently Asked Questions about Developer Setup</h2>
            <div style={S.answerSummary}>
              Read through our quick setup Q&amp;A to resolve connection issues, port configurations, and database query topics.
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
              <li><strong>Fast Setup in 2026:</strong> Deploy the codebase on local machines using standard npm installations.</li>
              <li><strong>Secure Auth:</strong> User access runs via Supabase logins and custom JWT tokens.</li>
              <li><strong>Optimized Databases:</strong> User lists reside in PostgreSQL; messaging runs on MongoDB clusters.</li>
              <li><strong>Live Relays:</strong> Persistent channels support Socket.IO handshakes with SSE fallbacks.</li>
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
export default DocsPage;
