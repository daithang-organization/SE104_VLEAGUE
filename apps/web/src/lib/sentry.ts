import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking.
 *
 * Set VITE_SENTRY_DSN in your .env to enable:
 *   VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
 *
 * When VITE_SENTRY_DSN is not set, Sentry is a no-op.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

  if (!dsn) {
    console.info('[Sentry] VITE_SENTRY_DSN not set — error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE, // 'development' | 'production'
    release: import.meta.env.VITE_APP_VERSION as string | undefined,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    // Capture 100 % of transactions in dev, 20 % in production
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    // Session Replay — capture 10 % of sessions, 100 % on error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export { Sentry };
