import { NextResponse } from 'next/server';

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

  // 202 Accepted is success; 400 may mean already subscribed (safe to treat as ok)
  if (!res.ok && res.status !== 202) {
    const body = await res.text();
    console.error('Klaviyo error', res.status, body);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
