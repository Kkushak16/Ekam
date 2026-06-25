import ws from 'k6/ws';
import { check } from 'k6';

// k6 Options: 50 concurrent users (VUs) running for 10 seconds
export const options = {
  vus: 50,
  duration: '10s',
};

export default function () {
  // Replace with local dynamic port / token as needed
  const url = `ws://localhost:3000/?token=YOUR_JWT_ACCESS_TOKEN_HERE`;

  const res = ws.connect(url, {}, function (socket) {
    socket.on('open', function () {
      // Send a ping to check response
      socket.send(JSON.stringify({ type: 'ping' }));
    });

    socket.on('message', function (data) {
      try {
        const parsed = JSON.parse(data);
        check(parsed, {
          'received pong': (r) => r.type === 'pong',
        });
      } catch (err) {
        check(null, {
          'invalid JSON received': () => false,
        });
      }
      socket.close();
    });

    socket.on('error', function (e) {
      console.error('Socket error occurred: ' + e.error());
    });
  });

  check(res, { 'connection successful (101)': (r) => r && r.status === 101 });
}
