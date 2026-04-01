// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from "@sentry/nestjs"

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Send structured logs to Sentry
    enableLogs: true,
    // Tracing - reduce sample rate in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Don't send PII data to Sentry in production
    sendDefaultPii: process.env.NODE_ENV !== 'production',
  });
}