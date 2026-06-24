// Sentry Node.js (server) init. No-op when no DSN is set. The DSN is publishable,
// so a single NEXT_PUBLIC_SENTRY_DSN can serve both client and server; SENTRY_DSN
// is an optional server-only override.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}
