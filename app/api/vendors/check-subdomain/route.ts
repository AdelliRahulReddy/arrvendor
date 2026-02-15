import { NextRequest, NextResponse } from 'next/server';
import { getVendorBySubdomain } from '@/lib/db';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
        return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 });
    }

    const vendor = await getVendorBySubdomain(subdomain);
    const available = vendor === null;

    return NextResponse.json({ available });
}
