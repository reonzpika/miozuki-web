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

  // Always call Create Profile, even with no name, to get back a profile id:
  // the Events API only reliably attaches an event to a profile when referenced
  // by id, not by email attributes alone (confirmed by testing -- an
  // attributes-only profile reference on an event silently never attaches,
  // even for a profile that already exists, with no error surfaced). 409 =
  // profile already exists, whose id is in the error body's
  // meta.duplicate_profile_id; we don't overwrite an existing name in that case.
  const profileAttributes: Record<string, string> = { email };
  if (name && typeof name === 'string' && name.trim().length > 0) {
    profileAttributes.first_name = name.trim();
  }
  const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
    method: 'POST',
    headers: klaviyoHeaders,
    body: JSON.stringify({
      data: { type: 'profile', attributes: profileAttributes },
    }),
  });
  let profileId: string | null = null;
  if (profileRes.status === 201) {
    const body = await profileRes.json().catch(() => null);
    profileId = body?.data?.id ?? null;
  } else if (profileRes.status === 409) {
    const body = await profileRes.json().catch(() => null);
    profileId = body?.errors?.[0]?.meta?.duplicate_profile_id ?? null;
  } else {
    const body = await profileRes.text();
    console.error('Klaviyo create-profile error', profileRes.status, body);
    Sentry.captureMessage('Klaviyo create-profile failed', {
      level: 'warning',
      extra: { status: profileRes.status, body },
    });
    // Non-fatal: continue to subscribe regardless
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

  // The bulk-subscribe job above is queued/batched by Klaviyo and can take several
  // minutes to actually add the profile to the list (Klaviyo's own guidance: list-
  // triggered flows enter within ~2-3 minutes, not instantly). This event exists so
  // the Welcome Series flow can be triggered by it directly instead of by list
  // membership, which fires far closer to real time. Non-fatal if it fails: the
  // profile is still subscribed either way.
  if (profileId) {
    const eventRes = await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers: klaviyoHeaders,
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            properties: {},
            metric: { data: { type: 'metric', attributes: { name: 'Signed Up For Discount' } } },
            profile: { data: { type: 'profile', id: profileId } },
          },
        },
      }),
    });
    if (!eventRes.ok) {
      const body = await eventRes.text();
      console.error('Klaviyo track-event error', eventRes.status, body);
      Sentry.captureMessage('Klaviyo track-event failed', {
        level: 'warning',
        extra: { status: eventRes.status, body, email },
      });
    }
  } else {
    console.error('Klaviyo track-event skipped: no profile id resolved', email);
    Sentry.captureMessage('Klaviyo track-event skipped: no profile id', {
      level: 'warning',
      extra: { email },
    });
  }

  return NextResponse.json({ ok: true });
}
