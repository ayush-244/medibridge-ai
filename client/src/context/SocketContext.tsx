import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import {
  connectSocket,
  disconnectSocket,
  getSocketInstance,
} from "@/services/socket.service";
import {
  SOCKET_EVENTS,
  type ConnectionStatus,
  type SocketEventName,
  type SocketEventPayloadMap,
  type SocketLastEvent,
} from "@/types/socket";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  lastEvent: SocketLastEvent | null;
  reconnect: () => void;
  disconnect: () => void;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

const TRACKED_EVENTS = Object.values(SOCKET_EVENTS) as SocketEventName[];

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("offline");
  const [lastEvent, setLastEvent] = useState<SocketLastEvent | null>(null);
  const eventHandlersRef = useRef<
    Partial<Record<SocketEventName, (data: unknown) => void>>
  >({});

  const reconnect = useCallback(() => {
    const instance = getSocketInstance() ?? connectSocket();
    if (!instance.connected) {
      instance.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setConnectionStatus("offline");
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnect();
      return;
    }

    const instance = connectSocket();
    setSocket(instance);

    const handleConnect = () => setConnectionStatus("connected");
    const handleDisconnect = () => setConnectionStatus("offline");
    const handleReconnectAttempt = () =>
      setConnectionStatus("reconnecting");
    const handleReconnect = () => setConnectionStatus("connected");
    const handleReconnectFailed = () => setConnectionStatus("offline");
    const handleConnectError = () => setConnectionStatus("reconnecting");

    instance.on("connect", handleConnect);
    instance.on("disconnect", handleDisconnect);
    instance.io.on("reconnect_attempt", handleReconnectAttempt);
    instance.io.on("reconnect", handleReconnect);
    instance.io.on("reconnect_failed", handleReconnectFailed);
    instance.on("connect_error", handleConnectError);

    setConnectionStatus(instance.connected ? "connected" : "reconnecting");

    TRACKED_EVENTS.forEach((eventName) => {
      const handler = (data: SocketEventPayloadMap[typeof eventName]) => {
        setLastEvent({
          event: eventName,
          data,
          timestamp: Date.now(),
        });
      };
      eventHandlersRef.current[eventName] = handler as (data: unknown) => void;
      instance.on(eventName, handler);
    });

    return () => {
      instance.off("connect", handleConnect);
      instance.off("disconnect", handleDisconnect);
      instance.io.off("reconnect_attempt", handleReconnectAttempt);
      instance.io.off("reconnect", handleReconnect);
      instance.io.off("reconnect_failed", handleReconnectFailed);
      instance.off("connect_error", handleConnectError);

      TRACKED_EVENTS.forEach((eventName) => {
        const handler = eventHandlersRef.current[eventName];
        if (handler) {
          instance.off(eventName, handler);
        }
      });

      disconnectSocket();
      setSocket(null);
      setConnectionStatus("offline");
    };
  }, [isAuthenticated, disconnect]);

  const value = useMemo(
    (): SocketContextValue => ({
      socket,
      isConnected: connectionStatus === "connected",
      connectionStatus,
      lastEvent,
      reconnect,
      disconnect,
    }),
    [socket, connectionStatus, lastEvent, reconnect, disconnect],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
