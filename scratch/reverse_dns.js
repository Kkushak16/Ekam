import dns from 'dns';

const ip = '2406:da14:25a:5801:60a:df1a:9cab:e4b6';
dns.reverse(ip, (err, hostnames) => {
  if (err) {
    console.error('Reverse dns failed:', err);
  } else {
    console.log('Hostnames:', hostnames);
  }
});
