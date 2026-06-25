// Weekly store digest emailed to Ting. Runs via Vercel Cron (see vercel.json,
// Mondays ~8am NZ) or can be invoked manually with ?secret=DIGEST_SECRET.
//
// Modes:
//   ?preview=1   return the rendered HTML, send nothing (safe to eyeball). Falls
//                back to sample data when analytics is not connected here.
//   (default)    build + send the email via Resend.
//
// Auth mirrors app/api/instagram/refresh-token: the Vercel-cron header, or a
// secret query param. Instantiate Resend inside the handler so a missing key
// never breaks the build.

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  buildDigestEmail,
  gatherDigestData,
  SAMPLE_DATA,
  type DigestData,
} from '@/lib/admin/weekly-digest';

export const dynamic = 'force-dynamic';

const DIGEST_FROM = 'Miozuki <enquiries@miozuki.co.nz>';
const DIGEST_TO = 'info@miozuki.co.nz';
const DIGEST_CC = 'ryo@clinicpro.co.nz';

// "Not connected here" = none of the headline sources returned anything.
function isEmpty(d: DigestData): boolean {
  return (
    !d.visitors &&
    !d.salesTotals &&
    d.searchClicks === null &&
    !(d.channels && d.channels.length) &&
    !(d.topPages && d.topPages.length)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const isPreview = searchParams.get('preview') === '1';

  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const isAuthorised =
    isVercelCron || (process.env.DIGEST_SECRET && secret === process.env.DIGEST_SECRET);
  if (!isAuthorised) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const live = await gatherDigestData();
  const weekEnding = new Date();

  if (isPreview) {
    const data = isEmpty(live) ? SAMPLE_DATA : live;
    const { html } = buildDigestEmail(data, weekEnding);
    return new NextResponse(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }

  const resendKey = process.env.RESEND_API_KEY_MIOZUKI;
  if (!resendKey) {
    console.error('[weekly-digest] RESEND_API_KEY_MIOZUKI missing, skipping send');
    return NextResponse.json({ skipped: 'no resend key' });
  }

  const { subject, html } = buildDigestEmail(live, weekEnding);
  const resend = new Resend(resendKey);
  const { error } = await resend.emails.send({
    from: DIGEST_FROM,
    to: DIGEST_TO,
    cc: DIGEST_CC,
    subject,
    html,
  });
  if (error) {
    console.error('[weekly-digest] Resend error', error);
    return NextResponse.json({ error: 'send failed' }, { status: 500 });
  }
  console.log('[weekly-digest] sent to', DIGEST_TO);
  return NextResponse.json({ sent: true });
}
