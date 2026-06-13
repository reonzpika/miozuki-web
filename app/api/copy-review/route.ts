import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.summary !== 'string' || body.summary.trim().length < 10) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { summary } = body as { summary: string };

  // Instantiate inside the handler so a missing key never breaks the build.
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: 'Miozuki Copy Review <noreply@clinicpro.co.nz>',
    to: 'ryo@clinicpro.co.nz',
    subject: `Miozuki copy review — ${new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    text: summary,
  });

  if (error) {
    console.error('Resend error', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
