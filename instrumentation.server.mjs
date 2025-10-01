import * as Sentry from "@sentry/remix";
import { getEnv } from "./app/lib/env.server";

const env = getEnv();

Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: 1,
  enableLogs: true
});
