import dns from 'dns';

async function poll() {
  const url = 'https://ekam-backend-3b2w.onrender.com/auth/register';
  const payload = {
    email: 'test_poll_' + Date.now() + '@example.com',
    password: 'Password123!',
    displayName: 'Test Poll User',
    username: 'test_poll_' + Date.now()
  };

  console.log('Polling Render backend for new deployment...');
  
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`[Attempt ${i+1}] Status:`, res.status);
      if (data.stack || (data.error && data.error.includes('Internal server error:'))) {
        console.log('🎉 New deployment detected!');
        console.log('Error Details:', JSON.stringify(data, null, 2));
        break;
      } else {
        console.log('Old deployment still active. Response:', data);
      }
    } catch (err) {
      console.log(`[Attempt ${i+1}] Request failed:`, err.message);
    }
    await new Promise(r => setTimeout(r, 10000)); // wait 10s
  }
}

poll();
