import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const CONTACT_SOURCES = new Set(['miozuki-contact-form']);

// Enquiries are emailed to Ting's monitored inbox. Sent from the Miozuki
// Resend domain (enquiries@miozuki.co.nz), with Reply-To set to the customer
// so a reply goes straight back to them.
const ENQUIRY_TO = 'info@miozuki.co.nz';
const ENQUIRY_FROM = 'Miozuki Enquiries <enquiries@miozuki.co.nz>';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, order, message, source, productTitle, mz_hp } = body as {
    name?: string;
    email?: string;
    order?: string;
    message?: string;
    source?: string;
    productTitle?: string;
    mz_hp?: string; // anti-spam trap — real users never fill this
  };

  // Anti-spam trap: the hidden mz_hp field is invisible to people but naive
  // bots fill it. Pretend success so the bot does not retry, but send nothing.
  if (typeof mz_hp === 'string' && mz_hp.trim().length > 0) {
    console.warn('[enquiry] honeypot tripped, dropping submission silently');
    return NextResponse.json({ ok: true });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (!message || typeof message !== 'string' || message.trim().length < 2) {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  const eventSource =
    typeof source === 'string' && CONTACT_SOURCES.has(source)
      ? source
      : 'miozuki-contact-form';
  const product =
    typeof productTitle === 'string' && productTitle.trim().length > 0
      ? productTitle.trim()
      : null;

  // 1. Email the enquiry to Ting. This is the must-succeed path. Instantiate
  //    inside the handler so a missing key never breaks the build.
  const resendKey = process.env.RESEND_API_KEY_MIOZUKI;
  if (!resendKey) {
    console.error('RESEND_API_KEY_MIOZUKI missing');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  const resend = new Resend(resendKey);
  const { error: emailError } = await resend.emails.send({
    from: ENQUIRY_FROM,
    to: ENQUIRY_TO,
    replyTo: email,
    subject: `New enquiry from ${name?.trim() || email}`,
    html: [
      `<p><strong>Name:</strong> ${name?.trim() ? escapeHtml(name.trim()) : '(not given)'}</p>`,
      `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
      order?.trim() ? `<p><strong>Order:</strong> ${escapeHtml(order.trim())}</p>` : '',
      product ? `<p><strong>Product:</strong> ${escapeHtml(product)}</p>` : '',
      `<p><strong>Message:</strong></p>`,
      `<p>${escapeHtml(message.trim()).replace(/\n/g, '<br>')}</p>`,
    ]
      .filter(Boolean)
      .join('\n'),
  });
  if (emailError) {
    console.error('Resend enquiry email error', emailError);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
  console.log('[enquiry] email accepted by Resend for', ENQUIRY_TO);

  // 2. Best-effort: log the profile to Klaviyo for the marketing list. The
  //    enquiry has already reached Ting, so never fail the request on a
  //    Klaviyo error.
  const apiKey = process.env.KLAVIYO_PRIVATE_KEY;
  if (apiKey) {
    try {
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
                source: eventSource,
                product_title: product,
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
        console.error('Klaviyo contact event error', res.status, await res.text());
      }
    } catch (err) {
      console.error('Klaviyo contact event threw', err);
    }
  }

  return NextResponse.json({ ok: true });
}
