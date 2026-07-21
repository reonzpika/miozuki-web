import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const CONTACT_SOURCES = new Set(['miozuki-contact-form', 'miozuki-custom-made-form']);

const ENQUIRY_TO = 'info@miozuki.co.nz';
const ENQUIRY_FROM = 'Miozuki Enquiries <enquiries@miozuki.co.nz>';

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 1_500_000;

type EnquiryPayload = {
  name?: string;
  email?: string;
  order?: string;
  message?: string;
  source?: string;
  productTitle?: string;
  mz_hp?: string;
  photos?: File[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function parseEnquiryRequest(request: Request): Promise<EnquiryPayload> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const photos = formData
      .getAll('photos')
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    return {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      order: String(formData.get('order') ?? ''),
      message: String(formData.get('message') ?? ''),
      source: String(formData.get('source') ?? ''),
      productTitle: String(formData.get('productTitle') ?? ''),
      mz_hp: String(formData.get('mz_hp') ?? ''),
      photos,
    };
  }

  const body = (await request.json()) as EnquiryPayload;
  return body;
}

function validatePhotos(photos: File[] | undefined): string | null {
  if (!photos || photos.length === 0) return null;
  if (photos.length > MAX_PHOTOS) return `Too many photos (max ${MAX_PHOTOS})`;

  for (const photo of photos) {
    if (!photo.type.startsWith('image/')) return 'Only image files are allowed';
    if (photo.size > MAX_PHOTO_BYTES) return 'One or more photos are too large';
  }

  return null;
}

export async function POST(request: Request) {
  const {
    name,
    email,
    order,
    message,
    source,
    productTitle,
    mz_hp,
    photos,
  } = await parseEnquiryRequest(request);

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

  const photoError = validatePhotos(photos);
  if (photoError) {
    return NextResponse.json({ error: photoError }, { status: 400 });
  }

  const eventSource =
    typeof source === 'string' && CONTACT_SOURCES.has(source)
      ? source
      : 'miozuki-contact-form';
  const product =
    typeof productTitle === 'string' && productTitle.trim().length > 0
      ? productTitle.trim()
      : null;
  const isCustomMade = eventSource === 'miozuki-custom-made-form';

  if (isCustomMade && (!photos || photos.length === 0)) {
    return NextResponse.json({ error: 'At least one inspiration photo is required' }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY_MIOZUKI;
  if (!resendKey) {
    console.error('RESEND_API_KEY_MIOZUKI missing');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const attachments =
    photos && photos.length > 0
      ? await Promise.all(
          photos.map(async (photo) => ({
            filename: photo.name || 'inspiration-photo.jpg',
            content: Buffer.from(await photo.arrayBuffer()),
          })),
        )
      : undefined;

  const resend = new Resend(resendKey);
  const { error: emailError } = await resend.emails.send({
    from: ENQUIRY_FROM,
    to: ENQUIRY_TO,
    replyTo: email,
    subject: isCustomMade
      ? `Custom made enquiry from ${name?.trim() || email}`
      : `New enquiry from ${name?.trim() || email}`,
    html: [
      `<p><strong>Name:</strong> ${name?.trim() ? escapeHtml(name.trim()) : '(not given)'}</p>`,
      `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
      order?.trim() ? `<p><strong>Order:</strong> ${escapeHtml(order.trim())}</p>` : '',
      product ? `<p><strong>Product:</strong> ${escapeHtml(product)}</p>` : '',
      photos && photos.length > 0
        ? `<p><strong>Photos attached:</strong> ${photos.length}</p>`
        : '',
      `<p><strong>Message:</strong></p>`,
      `<p>${escapeHtml(message.trim()).replace(/\n/g, '<br>')}</p>`,
    ]
      .filter(Boolean)
      .join('\n'),
    attachments,
  });
  if (emailError) {
    console.error('Resend enquiry email error', emailError);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
  console.log('[enquiry] email accepted by Resend for', ENQUIRY_TO);

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
                photo_count: photos?.length ?? 0,
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
