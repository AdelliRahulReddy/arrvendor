import { NextRequest, NextResponse } from 'next/server';
import { extractSubdomain } from './lib/utils';

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || 'localhost:3000';
    const mainDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';

    // Extract subdomain
    const subdomain = extractSubdomain(hostname, mainDomain);
    const { pathname } = request.nextUrl;

    // If no subdomain, continue to main site
    if (!subdomain) {
        return NextResponse.next();
    }

    // If it's an API route, allow it through
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // Rewrite dashboard routes with subdomain param
    if (pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone();
        url.pathname = pathname;
        url.searchParams.set('subdomain', subdomain);
        return NextResponse.rewrite(url);
    }

    // Rewrite public menu page
    const url = request.nextUrl.clone();
    url.pathname = '/menu';
    url.searchParams.set('subdomain', subdomain);

    return NextResponse.rewrite(url);
}
