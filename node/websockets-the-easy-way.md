# Websockets, the easy way
Whenever applications need little to no latency in client-server communication, WebSockets are usually the prefered option. According to Wikipedia, WebSocket is "a communications protocol, providing full-duplex communication channels over a single TCP connection". In other words, WebSockets allow bidirectional communication between a browser client and a server. This is not possible with HTTP.

WebSockets keep the connection open in order to offer fast connection with low latency and overhead. Moreover, they provide a standardized way so that the server can send messages to clients without waiting for the clients explicitly send a request first. Therefore, allowing a continuous two-way comunication between the server and a client.

There are many WebSocket libraries which either just implement the protocol and leave the rest to the developer, or build on top of the protocol with various additional features commonly required by realtime messaging applications. The Node.js WebSocket library [ws](https://github.com/websockets/ws) being one of the former; and [Socket.IO](https://socket.io/) one of the latter.

## Socket[]().IO

#### Server
```javascript
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
...
io.on('connection', (socket) => {
  console.log('New client connected');

  // Send a message (event `messageIncoming`) only to the connected client
  socket.emit('messageIncoming','Message for the client');

  // Send a message (event `messageIncoming`) to all connected clients
  io.emit('messageIncoming', 'Message for all clients');

  // Send a message (event `messageIncoming`) to all clients except the connected client
  socket.broadcast.emit('Message for all clients except connected client');

  // Listen to messages (events `messageOutgoing`) from the client
  socket.on('messageOutgoing', message=> {
    console.log('Message received: ' + message);
  });

  // Listen for disconnect event
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
...
```

#### Client on browser
```html
<script src="socket.io/socket.io.js"></script>
```
```javascript
const socket = io();

// Send messages (events `messageOutgoing`) to the server
sendBtn.addEventListener('click', event => {
  socket.emit('messageOutgoing', 'Message for server');
});

// Listen to messages (events `messageIncoming`) from the server
socket.on('messageIncoming', message => {
  console.log('New message received:', message);
});
```

## ws
#### Server
```javascript
const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', socket => {
  console.log('New client connected');

  // Send a message only to the connected client
  socket.send('Message for the client');
  
  // Send a message to all connected clients
  server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send('Message for all clients');
    }
  });

  // Send a message to all clients except the connected client
  server.clients.forEach(client => {
    if (client !== socket && client.readyState === WebSocket.OPEN) {
      client.send('Message for all clients except connected client');
    }
  });

  // Listen to messages from the client
  socket.on('message', message => {
    console.log('Message received' + message);
  });

  // Listen for closed or disconnected clients
  socket.on('close', () => {
    console.log('Client disconnected');
  });
});
```

#### Client on Node.js
[ws](https://github.com/websockets/ws) works only in Node.js. Browser clients must use the native WebSocket object. Alternatively, use a wrapper, like [isomorphic-ws](https://github.com/heineiuo/isomorphic-ws), to use the same code in the browser.
```javascript
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
  // Send messages to the server
  sendBtn.addEventListener('click', () => {
    socket.send('Message to the server');
  });
};

// Listen for messages from the server
socket.onmessage = message => {
  console.log(message);
};
```
