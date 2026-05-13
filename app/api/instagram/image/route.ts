import { NextResponse } from 'next/server';

const BASE = 'https://graph.facebook.com/v21.0';

// Proxy Instagram images so signed CDN URLs never leak to the client. On each
// request we fetch a current media_url from the Graph API, then stream the
// image bytes back. Avoids the 403 problem where cached media_urls expire.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id || !/^\d+(_\d+)?$/.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Instagram not configured' }, { status: 500 });
  }

  const metaRes = await fetch(
    `${BASE}/${id}?fields=media_type,media_url,thumbnail_url&access_token=${token}`,
    // Cache the media_url lookup for 25min, Instagram signed URLs usually
    // live ~1h, so we always refresh before they can expire.
    { next: { revalidate: 1500 } }
  );
  if (!metaRes.ok) {
    return NextResponse.json({ error: 'Instagram media lookup failed' }, { status: 502 });
  }
  const meta: { media_type?: string; media_url?: string; thumbnail_url?: string } = await metaRes.json();
  const src = meta.media_type === 'VIDEO' ? (meta.thumbnail_url ?? meta.media_url) : meta.media_url;
  if (!src) {
    return NextResponse.json({ error: 'No image URL' }, { status: 404 });
  }

  const imgRes = await fetch(src);
  if (!imgRes.ok || !imgRes.body) {
    return NextResponse.json({ error: 'Image fetch failed' }, { status: 502 });
  }

  return new Response(imgRes.body, {
    status: 200,
    headers: {
      'Content-Type': imgRes.headers.get('content-type') ?? 'image/jpeg',
      'Content-Length': imgRes.headers.get('content-length') ?? '',
      // Cache aggressively, the proxied image bytes don't change per-post.
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
