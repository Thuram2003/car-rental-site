import { NextRequest, NextResponse } from 'next/server';

// This route handles the old verification link format and redirects to the new page
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Redirect to the verify-email page with the token and email
  const verifyUrl = new URL('/verify-email', request.url);
  if (token) verifyUrl.searchParams.set('token', token);
  if (email) verifyUrl.searchParams.set('email', email);

  return NextResponse.redirect(verifyUrl);
}
