import { io } from "socket.io-client";

const token = "invalid-token";
const socket = io("http://localhost:3001", {
  auth: { token },
  reconnectionAttempts: 1,
});

socket.on("connect_error", (err) => {
  console.error("Connect error:", err.message);
  process.exit(0);
});

socket.on("connect", () => {
  console.log("Connected unexpectedly");
  process.exit(0);
});
