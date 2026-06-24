// Next.js server instrumentation hook. Loads the right Sentry config per runtime
// and forwards server-side request errors (Server Components, route handlers,
// proxy) to Sentry via onRequestError. All paths are no-ops when no DSN is set.
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
