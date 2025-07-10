import { createServer as createTCPServer } from "net";

function buildFrame(type, data) {
    const payload = Buffer.from(data ?? "", "utf8");
    const buffer = Buffer.alloc(3 + payload.length);
    buffer.writeUInt8(type, 0);
    buffer.writeUInt16BE(payload.length, 1);
    payload.copy(buffer, 3);
    return buffer;
}

function parseFrame(buffer) {
    const type = buffer.readUInt8(0);
    const length = buffer.readUInt16BE(1);
    const payload = buffer.slice(3, 3 + length).toString();
    return { type, length, payload };
}

class Socket {
    constructor(native, pool) {
        this.native = native;
        this.pool = pool;
        this.handlers = {};
    }

    data(callback) {
        this.handlers["data"] = callback;
    }

    send(data) {
        this.native.write(buildFrame(3, data));
    }

    emit(data) {
        for (const client of this.pool) {
            client.native.write(buildFrame(3, data));
        }
    }

    broadcast(data) {
        for (const client of this.pool) {
            if (client !== this) {
                client.native.write(buildFrame(3, data));
            }
        }
    }
}

let tcpCallback;

export function createServer(options = { ping: { active: false, interval: 0, ping: "" }, logs: {} }) {
    const clients = new Set();
    const server = createTCPServer(nativeSocket => {
        if (options.logs.connect) console.log(options.logs.connect);
        const client = new Socket(nativeSocket, clients);
        clients.add(client);
        if (tcpCallback) tcpCallback(client);
        let buffer = Buffer.alloc(0);
        nativeSocket.on("data", chunk => {
            buffer = Buffer.concat([buffer, chunk]);
            while (buffer.length >= 3) {
                const length = buffer.readUInt16BE(1);
                if (buffer.length < 3 + length) break;
                const frame = parseFrame(buffer);
                client.handlers["data"]?.(frame);
                buffer = buffer.slice(3 + length);
            }
        });

        let pingInterval;
        nativeSocket.on("close", () => {
            clearInterval(pingInterval);
            clients.delete(client);
        });

        nativeSocket.on("error", err => {
            if (options.logs.disconnect)  console.log(options.logs.disconnect);
        });

        if (options.ping.active) {
            pingInterval = setInterval(() => {
                if (!nativeSocket.destroyed) {
                    nativeSocket.write(buildFrame(1));
                    if (options.ping.ping) console.log(options.ping.ping);
                }
            }, options.ping.interval);
        }
    });

    return {
        listen: (PORT, callback) => server.listen(PORT, callback),
        TCP: callback => { tcpCallback = callback }
    };
}

export default { createServer };