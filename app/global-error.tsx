'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error('Unhandled root error', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f3ef',
          color: '#0f0f0f',
          fontFamily: 'Georgia, serif',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '32rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem', opacity: 0.7 }}>
            An unexpected error occurred. Please try again, or return to the homepage.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #0f0f0f',
                backgroundColor: '#0f0f0f',
                color: '#f5f3ef',
                fontSize: '0.85rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                borderRadius: 0,
              }}
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid #0f0f0f',
                color: '#0f0f0f',
                fontSize: '0.85rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
