import { useEffect, useState } from "react";

const COUNTDOWN_INTERVAL_MS = 60_000;

export function useCountdownTick(intervalMs = COUNTDOWN_INTERVAL_MS) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
