import { NextResponse } from 'next/server';

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

  const res = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
    method: 'POST',
    headers: {
      accept: 'application/vnd.api+json',
      revision: '2024-02-15',
      'content-type': 'application/vnd.api+json',
      Authorization: `Klaviyo-API-Key ${apiKey}`,
    },
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
                  ...(name ? { first_name: name } : {}),
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
