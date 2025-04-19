const http = require("http");
const WebSocket = require("ws");

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server is running.\n");
});

const wss = new WebSocket.Server({ server });

let adminSocket = null;
let clientSocket = null;

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "identify") {
        if (data.role === "admin") {
          adminSocket = ws;
          console.log("Admin connected");
        } else if (data.role === "client") {
          clientSocket = ws;
          console.log("Client connected");
        }
      }

      if (data.type === "audio_chunk" && adminSocket && ws === clientSocket) {
        adminSocket.send(JSON.stringify({ type: "audio_chunk", data: data.data }));
      }
    } catch (e) {
      console.error("Invalid message:", message);
    }
  });

  ws.on("close", () => {
    if (ws === adminSocket) adminSocket = null;
    if (ws === clientSocket) clientSocket = null;
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
