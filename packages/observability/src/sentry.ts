import type { SeverityLevel } from "@sentry/node";
import type { LogLevel } from "effect";
import * as Sentry from "@sentry/node";
import { Array, HashMap, Logger } from "effect";

export interface SentryConfig {
  dsn: string;
  environment?: string;
}

const mapLogLevelToSeverity = (logLevel: LogLevel.LogLevel): SeverityLevel => {
  switch (logLevel._tag) {
    case "Fatal":
      return "fatal";
    case "Error":
      return "error";
    case "Warning":
      return "warning";
    case "Info":
      return "info";
    case "Debug":
    case "Trace":
      return "debug";
    case "All":
    case "None":
    default:
      return "info";
  }
};

export const makeSentryLogger = (config: SentryConfig) => {
  // Hot reload guard
  if (!Sentry.getClient()) {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment ?? "production",
    });
  }

  return Logger.make(({ message: message_, logLevel, annotations }) => {
    const message = Array.ensure(message_);

    const severity = mapLogLevelToSeverity(logLevel);

    const extra = Object.fromEntries(HashMap.toEntries(annotations));

    Sentry.captureException(message, {
      level: severity,
      extra,
    });
  });
};
