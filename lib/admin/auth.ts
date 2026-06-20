// Auth for the /admin dashboard. Deliberately minimal: a single shared
// password for the two people who use it (Ryo and Ting). No auth provider.
//
// Flow: the login form posts the password to /api/admin/login. If it matches
// ADMIN_PASSWORD, the route sets an httpOnly cookie holding ADMIN_SESSION_SECRET.
// middleware.ts gates every /admin route by comparing that cookie to the secret.
//
// Env (set in .env.local and Vercel, never commit):
//   ADMIN_PASSWORD        what Ryo/Ting type on the login screen
//   ADMIN_SESSION_SECRET  opaque value stored in the session cookie

export const ADMIN_COOKIE = 'miozuki_admin';

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return input === expected;
}

export function sessionSecret(): string | undefined {
  return process.env.ADMIN_SESSION_SECRET;
}
