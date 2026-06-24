// Sentry browser-side init. Mirrors the env-gated, no-op-when-unset pattern used
// by components/clarity.tsx and components/meta-pixel.tsx: with no DSN set (local
// dev, preview builds without the key), Sentry never initialises and sends nothing.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    // 10% of transactions sampled for performance. Errors are always captured.
    tracesSampleRate: 0.1,
    // No Sentry session replay: Microsoft Clarity already records sessions.
  });
}

// Instruments App Router client-side navigations so route changes are traced.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
