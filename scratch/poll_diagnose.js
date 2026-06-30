async function poll() {
  const diagnoseUrl = 'https://ekam-backend-3b2w.onrender.com/api/diagnose';
  const registerUrl = 'https://ekam-backend-3b2w.onrender.com/auth/register';

  console.log('Polling Render backend...');

  for (let i = 0; i < 40; i++) {
    try {
      // 1. Try hitting /api/diagnose
      const diagRes = await fetch(diagnoseUrl);
      if (diagRes.status === 200) {
        const diagData = await diagRes.json();
        console.log('🎉 /api/diagnose is LIVE!');
        console.log('Environment Variables Status:', JSON.stringify(diagData, null, 2));
        
        // 2. Since diagnose is live, let's also trigger a register to see the stack trace if it still fails
        const regRes = await fetch(registerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test_poll_diag_' + Date.now() + '@example.com',
            password: 'Password123!',
            displayName: 'Test Poll Diag User',
            username: 'test_poll_diag_' + Date.now()
          })
        });
        const regData = await regRes.json();
        console.log('Register Status:', regRes.status);
        console.log('Register Response:', JSON.stringify(regData, null, 2));
        break;
      } else {
        console.log(`[Attempt ${i+1}] /api/diagnose returned ${diagRes.status} (Not live yet)`);
      }
    } catch (err) {
      console.log(`[Attempt ${i+1}] Failed to connect:`, err.message);
    }
    await new Promise(r => setTimeout(r, 10000)); // wait 10s
  }
}

poll();
