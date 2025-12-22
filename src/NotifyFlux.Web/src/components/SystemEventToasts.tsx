import { useCallback, useEffect, useRef, useState } from "react";
import { registerSystemEventHandlers, unregisterSystemEventHandlers } from "../socket/handlers";
import { SystemEvent } from "../types";

type ToastItem = {
  readonly id: string;
  readonly event: SystemEvent;
  readonly receivedAt: number;
};

const SOUND_STORAGE_KEY = "notifyflux_system_sound";
const AUTO_DISMISS_MS = 8000;
let audioContext: AudioContext | null = null;

const readSoundPreference = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }
  return window.localStorage.getItem(SOUND_STORAGE_KEY) !== "off";
};

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined" || !window.AudioContext) {
    return null;
  }
  if (!audioContext) {
    audioContext = new window.AudioContext();
  }
  return audioContext;
};

const playSystemEventSound = (): void => {
  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.05;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.18);
};

const createToastId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

export const SystemEventToasts = (): JSX.Element => {
  const [toasts, setToasts] = useState<ReadonlyArray<ToastItem>>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(readSoundPreference);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  const timersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SOUND_STORAGE_KEY, soundEnabled ? "on" : "off");
    }
  }, [soundEnabled]);

  const dismissToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const handleEvent = useCallback((event: SystemEvent): void => {
    const id = createToastId();
    const item: ToastItem = { id, event, receivedAt: Date.now() };
    setToasts((prev) => [item, ...prev].slice(0, 4));
    if (soundEnabledRef.current) {
      playSystemEventSound();
    }
    const timeoutId = window.setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
    timersRef.current.set(id, timeoutId);
  }, [dismissToast]);

  useEffect(() => {
    registerSystemEventHandlers(handleEvent);
    return () => {
      unregisterSystemEventHandlers(handleEvent);
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, [handleEvent]);

  const toggleSound = (): void => setSoundEnabled((prev) => !prev);

  if (toasts.length === 0) {
    return <div className="system-toast-stack" aria-live="polite" />;
  }

  return (
    <div className="system-toast-stack" aria-live="polite">
      <div className="system-toast-controls">
        <button type="button" className="button-secondary small" onClick={toggleSound}>
          Sound: {soundEnabled ? "On" : "Off"}
        </button>
      </div>
      {toasts.map((toast) => (
        <div key={toast.id} className="system-toast">
          <div className="system-toast-header">
            <div>
              <p className="eyebrow">System Event</p>
              <h3>{toast.event.code}</h3>
            </div>
            <button type="button" className="button-secondary small" onClick={() => dismissToast(toast.id)}>Dismiss</button>
          </div>
          <p className="system-toast-message">{toast.event.message}</p>
          <div className="system-toast-meta">
            <span>{new Date(toast.event.timestamp).toLocaleTimeString()}</span>
            <span>Tenant: {toast.event.tenantId}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
