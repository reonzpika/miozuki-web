import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, email, order, message } = await request.json();

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (!message || typeof message !== 'string' || message.trim().length < 2) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  const apiKey = process.env.KLAVIYO_PRIVATE_KEY;
  if (!apiKey) {
    console.error('Klaviyo env var missing');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const res = await fetch('https://a.klaviyo.com/api/events/', {
    method: 'POST',
    headers: {
      accept: 'application/vnd.api+json',
      revision: '2024-02-15',
      'content-type': 'application/vnd.api+json',
      Authorization: `Klaviyo-API-Key ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: 'event',
        attributes: {
          properties: {
            name: name ?? null,
            order: order ?? null,
            message,
            source: 'miozuki-contact-form',
          },
          metric: {
            data: {
              type: 'metric',
              attributes: { name: 'Contact form submission' },
            },
          },
          profile: {
            data: {
              type: 'profile',
              attributes: {
                email,
                ...(name ? { first_name: name } : {}),
              },
            },
          },
        },
      },
    }),
  });

  if (!res.ok && res.status !== 202) {
    const body = await res.text();
    console.error('Klaviyo contact event error', res.status, body);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
