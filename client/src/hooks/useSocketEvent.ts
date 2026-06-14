import { useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import type { SocketEventName, SocketEventPayloadMap } from "@/types/socket";

type SocketListener = (...args: unknown[]) => void;

export function useSocketEvent<E extends SocketEventName>(
  event: E,
  handler: (data: SocketEventPayloadMap[E]) => void,
  enabled = true,
): void {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!socket || !enabled) return;

    const listener: SocketListener = (...args) => {
      handlerRef.current(args[0] as SocketEventPayloadMap[E]);
    };

    // Custom app events are not in Socket.IO's reserved event typings.
    socket.on(event as string, listener as never);
    return () => {
      socket.off(event as string, listener as never);
    };
  }, [socket, event, enabled]);
}
