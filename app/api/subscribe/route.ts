import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

const KLAVIYO_REVISION = '2024-02-15';

export async function POST(request: Request) {
  const { email, name } = await request.json();

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const apiKey = process.env.KLAVIYO_PRIVATE_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;

  if (!apiKey || !listId) {
    console.error('Klaviyo env vars missing');
    Sentry.captureMessage('Klaviyo env vars missing', { level: 'error' });
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const klaviyoHeaders = {
    accept: 'application/vnd.api+json',
    revision: KLAVIYO_REVISION,
    'content-type': 'application/vnd.api+json',
    Authorization: `Klaviyo-API-Key ${apiKey}`,
  };

  // Save the first_name via the Create Profile endpoint. The
  // profile-subscription-bulk-create-jobs endpoint only accepts email/phone/
  // subscriptions, so the name must be set separately. 409 = profile already
  // exists, which is fine, we don't overwrite existing names.
  if (name && typeof name === 'string' && name.trim().length > 0) {
    const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: klaviyoHeaders,
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: { email, first_name: name.trim() },
        },
      }),
    });
    if (!profileRes.ok && profileRes.status !== 409) {
      const body = await profileRes.text();
      console.error('Klaviyo create-profile error', profileRes.status, body);
      Sentry.captureMessage('Klaviyo create-profile failed', {
        level: 'warning',
        extra: { status: profileRes.status, body },
      });
      // Non-fatal: continue to subscribe regardless
    }
  }

  const res = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
    method: 'POST',
    headers: klaviyoHeaders,
    body: JSON.stringify({
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [
              {
                type: 'profile',
                attributes: {
                  email,
                  subscriptions: {
                    email: { marketing: { consent: 'SUBSCRIBED' } },
                  },
                },
              },
            ],
          },
        },
        relationships: {
          list: { data: { type: 'list', id: listId } },
        },
      },
    }),
  });

  // 202 Accepted (within res.ok's 200-299 range) is the only success case for this
  // endpoint. A 400 here is a genuinely malformed/rejected request (bad field,
  // invalid consent shape, etc), not "already subscribed" -- the bulk-subscribe
  // endpoint is idempotent for existing subscribers and returns 202 for them too.
  // Do not swallow it as success; surface it and log the real reason so a specific
  // failure is diagnosable later instead of just "something went wrong".
  if (!res.ok) {
    const body = await res.text();
    console.error('Klaviyo error', res.status, body);
    Sentry.captureMessage('Klaviyo subscribe failed', {
      level: 'error',
      extra: { status: res.status, body, email },
    });
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }

  const jobBody = await res.json().catch(() => null);
  const jobId = jobBody?.data?.id ?? null;
  console.log('Klaviyo subscribe job accepted', jobId, 'for', email);
  Sentry.addBreadcrumb({
    category: 'klaviyo',
    message: 'Subscribe job accepted',
    data: { jobId, email },
  });

  return NextResponse.json({ ok: true });
}
