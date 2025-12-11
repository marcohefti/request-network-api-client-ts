export type LogLevel = "info" | "warn";

export interface ScenarioLogger {
  (level: LogLevel, message: string, payload: Record<string, unknown>): void;
}
