import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/constants";

let socketInstance: Socket | null = null;

export function getSocketInstance(): Socket | null {
  return socketInstance;
}

export function connectSocket(): Socket {
  if (socketInstance?.connected) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.connect();
    return socketInstance;
  }

  socketInstance = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ["websocket", "polling"],
  });

  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
