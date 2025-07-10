/// <reference types="node" />

import { Server } from "net";

interface Frame {
  type: number;
  length: number;
  payload: string;
}

interface LogsOptions {
  connect?: string;
  disconnect?: string;
}

interface PingOptions {
  active: boolean;
  interval: number;
  ping?: string;
}

interface ServerOptions {
  ping?: PingOptions;
  logs?: LogsOptions;
}

interface Socket {
  data(callback: (frame: Frame) => void): void;
  send(data: string): void;
  emit(data: string): void;
  broadcast(data: string): void;
}

interface TCPHandler {
  (client: Socket): void;
}

interface CustomServer {
  listen(port: number, callback?: () => void): Server;
  TCP(callback: TCPHandler): void;
}

/** Create and configure a custom TCP server. */
export function createServer(options?: ServerOptions): CustomServer;

/** Default export: createServer function wrapped */
declare const defaultExport: {
  createServer: typeof createServer;
};

export default defaultExport;