import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/((?!api|_next|assets|images|css|js|favicon.ico|robots.txt|sitemap.xml|maintenance.html).*)'
  ]
};

export default function middleware(req) {
  const maintenance = process.env.MAINTENANCE_MODE;
  if (maintenance && maintenance.toLowerCase() === 'true') {
    const url = req.nextUrl.clone();
    url.pathname = '/maintenance.html';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

