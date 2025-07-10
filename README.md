# cftp
**Controlled Frame Transmission Protocol over TCP**

CFTP is a lightweight and extensible framework for transmitting structured data frames over raw TCP sockets. It’s designed for real-time multiplayer applications, custom protocols, or any system that benefits from precise control over frame structure and delivery.

---

## Features

- Fast frame parsing and building using binary buffers
- Clean API for handling framed data transmissions
- Built-in ping mechanism with optional logging
- Encapsulated socket management for scalable design
- Fully minified and optimized for deployment

---

## Installation

```bash
npm install cftp
```

## Usage

<pre><code class="language-js">
const cftp = require("cftp");

const server = createServer({
  ping: { active: true, interval: 5000, ping: "ping sent" },
  logs: { connect: "Client joined", disconnect: "Client left" }
});

server.TCP(socket => {
  socket.data(frame => {
    console.log("Received:", frame);
    socket.broadcast("A Client Speaks: " + frame.payload);
  });
});

server.listen(3000, () => {
  console.log("cftp server running on port 3000");
});
</code></pre>

## Structure

Each data frame follows this format:

- type: UInt8 (frame ID or opcode) | 1 byte (0-255)

- length: UInt16BE (payload length) | 2 bytes (0-65,535)

- payload: UTF-8 string (content) | n (length) bytes (0-2^n)


## License

MIT - 7/10/2025

This software is licensed under the MIT License. While modification is permitted, it is discouraged to alter the original source code. If you have suggestions or improvements, please open an issue or contact me directly.