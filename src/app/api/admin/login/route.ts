import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, createAdminSession, validateAdminCredentials } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const username = String(form.get('username') ?? '');
  const password = String(form.get('password') ?? '');

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.redirect(new URL('/admin?error=invalid', request.url), 303);
  }

  const session = await createAdminSession(username);
  const response = NextResponse.redirect(new URL('/admin', request.url), 303);
  response.cookies.set(ADMIN_COOKIE, session.token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: session.maxAge,
  });
  return response;
}
