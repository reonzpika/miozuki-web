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
    ignoreErrors: [
      // Meta's in-app browser (Facebook/Instagram) injects its own perf script that
      // calls window.webkit.messageHandlers, which is absent outside an iOS WKWebView.
      // It throws on fbclid ad traffic. Not our code and not actionable, so drop it.
      'sendDataToNative',
      /webkit\.messageHandlers/,
    ],
  });
}

// Instruments App Router client-side navigations so route changes are traced.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
