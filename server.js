const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files (HTML, Three.js code, etc.)
app.use(express.static(path.join(__dirname, 'three.js')));

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('WebSocket connection established');

  ws.on('message', (message) => {
    // Here you can parse the incoming data if it's JSON
    const data = JSON.parse(message);
    console.log('Data received:', data);
    // Broadcast data to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Start server on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
