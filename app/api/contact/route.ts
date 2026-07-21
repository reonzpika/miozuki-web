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
  phone?: string;
  budget?: string;
  leadTime?: string;
  hearAbout?: string;
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

function fieldRow(label: string, value: string): string {
  return `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`;
}

function buildEnquiryEmailHtml(payload: {
  name?: string;
  email: string;
  order?: string;
  product?: string | null;
  phone?: string;
  budget?: string;
  leadTime?: string;
  hearAbout?: string;
  message: string;
  photoCount: number;
  isCustomMade: boolean;
}): string {
  const rows = [
    fieldRow('Name', payload.name?.trim() || '(not given)'),
    fieldRow('Email', payload.email),
  ];

  if (payload.isCustomMade) {
    if (payload.phone?.trim()) rows.push(fieldRow('Phone', payload.phone.trim()));
    if (payload.budget?.trim()) rows.push(fieldRow('Budget', payload.budget.trim()));
    if (payload.leadTime?.trim()) rows.push(fieldRow('Lead time', payload.leadTime.trim()));
    if (payload.hearAbout?.trim()) {
      rows.push(fieldRow('How they heard about Miozuki', payload.hearAbout.trim()));
    }
  }

  if (payload.order?.trim()) rows.push(fieldRow('Order', payload.order.trim()));
  if (payload.product) rows.push(fieldRow('Product', payload.product));
  if (payload.photoCount > 0) rows.push(fieldRow('Photos attached', String(payload.photoCount)));

  rows.push('<p><strong>Message:</strong></p>');
  rows.push(`<p>${escapeHtml(payload.message.trim()).replace(/\n/g, '<br>')}</p>`);

  return rows.join('\n');
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
      phone: String(formData.get('phone') ?? ''),
      budget: String(formData.get('budget') ?? ''),
      leadTime: String(formData.get('leadTime') ?? ''),
      hearAbout: String(formData.get('hearAbout') ?? ''),
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
    phone,
    budget,
    leadTime,
    hearAbout,
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

  if (isCustomMade) {
    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }
    if (!budget?.trim()) {
      return NextResponse.json({ error: 'Budget required' }, { status: 400 });
    }
    if (!leadTime?.trim()) {
      return NextResponse.json({ error: 'Lead time required' }, { status: 400 });
    }
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
    html: buildEnquiryEmailHtml({
      name,
      email,
      order,
      product,
      phone,
      budget,
      leadTime,
      hearAbout,
      message,
      photoCount: photos?.length ?? 0,
      isCustomMade,
    }),
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
                phone: phone?.trim() || null,
                budget: budget?.trim() || null,
                lead_time: leadTime?.trim() || null,
                hear_about: hearAbout?.trim() || null,
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
