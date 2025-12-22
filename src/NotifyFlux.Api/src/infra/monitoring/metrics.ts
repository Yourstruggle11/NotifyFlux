import { Request, Response } from "express";
import { Counter, Gauge, Registry, collectDefaultMetrics } from "prom-client";

const registry = new Registry();
collectDefaultMetrics({ register: registry });

const notificationsEmittedTotal = new Counter({
  name: "notifyflux_notifications_emitted_total",
  help: "Total notifications emitted via Socket.IO",
  registers: [registry]
});

const systemEventsEmittedTotal = new Counter({
  name: "notifyflux_system_events_emitted_total",
  help: "Total system events emitted",
  registers: [registry]
});

const connectedSocketsGauge = new Gauge({
  name: "notifyflux_socket_connected_clients_total",
  help: "Currently connected sockets",
  registers: [registry]
});

const changeStreamRestartsTotal = new Counter({
  name: "notifyflux_change_stream_restarts_total",
  help: "Number of change stream restarts",
  registers: [registry]
});

export const metricsHandler = async (_req: Request, res: Response): Promise<void> => {
  res.set("Content-Type", registry.contentType);
  res.send(await registry.metrics());
};

export const incrementNotificationsEmitted = (): void => notificationsEmittedTotal.inc();
export const incrementSystemEvents = (): void => systemEventsEmittedTotal.inc();
export const incrementChangeStreamRestarts = (): void => changeStreamRestartsTotal.inc();
export const incrementConnectedSockets = (): void => connectedSocketsGauge.inc();
export const decrementConnectedSockets = (): void => connectedSocketsGauge.dec();
