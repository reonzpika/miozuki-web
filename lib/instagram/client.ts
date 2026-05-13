// Instagram Graph API via Facebook endpoint, server-side only.
// Uses graph.facebook.com (not graph.instagram.com) with a Facebook User
// Access Token and the Instagram Business Account user ID.
//
// Token setup: developers.facebook.com/tools/explorer
// → select app "Miozuki Website-IG" → Generate Access Token
// → tick instagram_business_basic → Generate
// → exchange for long-lived: GET /api/instagram/refresh-token
//
// Env vars required:
//   INSTAGRAM_ACCESS_TOKEN, Facebook User Access Token
//   INSTAGRAM_USER_ID, Instagram Business Account ID (17841475205382310)

import type { InstagramPost } from './types';

const BASE = 'https://graph.facebook.com/v21.0';

export async function getInstagramPosts(limit = 10): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  if (!token || !userId) return [];

  try {
    const res = await fetch(
      `${BASE}/${userId}/media?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp,caption&limit=${limit}&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data: { data?: InstagramPost[] } = await res.json();
    return (data.data ?? []).filter(
      (p) => p.media_type !== 'VIDEO' || p.thumbnail_url
    );
  } catch {
    return [];
  }
}
