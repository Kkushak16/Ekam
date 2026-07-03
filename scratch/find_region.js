import fetch from 'node-fetch';

async function find() {
  const ip = '2406:da14:25a:5801:60a:df1a:9cab:e4b6';
  console.log(`Fetching AWS IP ranges to check IP: ${ip}...`);
  try {
    const res = await fetch('https://ip-ranges.amazonaws.com/ip-ranges.json');
    const data = await res.json();
    const matches = [];
    
    // Simple hex/binary matching for IPv6
    // 2406:da14:25a:5801:60a:df1a:9cab:e4b6
    // We can convert IPv6 to a normalized 32-hex character string
    const targetHex = ip.split(':').map(part => part.padStart(4, '0')).join('');
    
    for (const prefix of data.ipv6_prefixes) {
      const parts = prefix.ipv6_prefix.split('/');
      const cidr = parseInt(parts[1], 10);
      const prefixIp = parts[0];
      const prefixHex = prefixIp.split(':').map(part => part.padStart(4, '0')).join('').padEnd(32, '0');
      
      const numNibbles = Math.ceil(cidr / 4);
      const targetSub = targetHex.substring(0, numNibbles);
      const prefixSub = prefixHex.substring(0, numNibbles);
      
      if (targetSub === prefixSub) {
        matches.push(prefix);
      }
    }
    
    console.log('Matches:', matches);
  } catch (err) {
    console.error(err);
  }
}

find();
