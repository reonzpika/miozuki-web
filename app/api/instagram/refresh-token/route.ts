// Refresh the Instagram long-lived access token (valid 60 days).
// Call this every ~50 days — either manually or via Vercel Cron.
//
// Vercel Cron setup (vercel.json):
// { "crons": [{ "path": "/api/instagram/refresh-token", "schedule": "0 9 1,15 * *" }] }
// (runs on the 1st and 15th of each month — well within the 60-day window)
//
// The response includes the new token. Copy it to INSTAGRAM_ACCESS_TOKEN in
// Vercel env vars, then redeploy (or wait for the next ISR cycle).
//
// Protected by INSTAGRAM_REFRESH_SECRET to prevent public access.

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Allow Vercel Cron (sends x-vercel-cron header) or manual call with secret
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const isAuthorised =
    isVercelCron ||
    (process.env.INSTAGRAM_REFRESH_SECRET &&
      secret === process.env.INSTAGRAM_REFRESH_SECRET);

  if (!isAuthorised) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'INSTAGRAM_ACCESS_TOKEN not set' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.INSTAGRAM_APP_ID}&client_secret=${process.env.INSTAGRAM_APP_SECRET}&fb_exchange_token=${token}`
    );
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: 'Instagram API error', detail: err }, { status: 502 });
    }
    const data: { access_token: string; token_type: string; expires_in: number } =
      await res.json();

    return NextResponse.json({
      ok: true,
      new_token: data.access_token,
      expires_in_days: Math.floor(data.expires_in / 86400),
      action_required:
        data.access_token !== token
          ? 'Update INSTAGRAM_ACCESS_TOKEN in Vercel env vars with new_token, then redeploy.'
          : 'Token expiry extended — no change needed.',
    });
  } catch (err) {
    return NextResponse.json({ error: 'Fetch failed', detail: String(err) }, { status: 500 });
  }
}
