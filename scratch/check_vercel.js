async function check() {
  try {
    const res = await fetch('https://ekam-woad.vercel.app');
    const html = await res.text();
    const match = html.match(/\/assets\/[^\"]+\.js/);
    if (!match) {
      console.log('No JS bundle found in index.html');
      return;
    }
    console.log('Found JS bundle:', match[0]);
    const jsRes = await fetch('https://ekam-woad.vercel.app' + match[0]);
    const js = await jsRes.text();
    console.log('Contains onrender.com:', js.includes('onrender.com'));
    console.log('Contains Email/Password Login View:', js.includes('Email/Password Login View'));
  } catch (err) {
    console.error('Error:', err);
  }
}
check();
