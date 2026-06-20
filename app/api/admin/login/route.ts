import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, checkPassword, sessionSecret } from '@/lib/admin/auth';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get('password') ?? '');
  const from = String(form.get('from') ?? '/admin');

  if (!checkPassword(password)) {
    return NextResponse.redirect(new URL('/admin/login?error=1', req.url), 303);
  }

  const dest = from.startsWith('/admin') && from !== '/admin/login' ? from : '/admin';
  const res = NextResponse.redirect(new URL(dest, req.url), 303);

  const secret = sessionSecret();
  if (secret) {
    res.cookies.set(ADMIN_COOKIE, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}
