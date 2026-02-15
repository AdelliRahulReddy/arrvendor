import { NextRequest, NextResponse } from 'next/server';
import { createVendor, getVendorBySubdomain, getVendorById, updateVendor, getVendors } from '@/lib/db';
import { validateSubdomain } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET vendor by subdomain
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const subdomain = searchParams.get('subdomain');
    const id = searchParams.get('id');

    console.log('[API /api/vendors GET] subdomain:', subdomain, 'id:', id);

    if (subdomain) {
        console.log('[API] Looking for vendor with subdomain:', subdomain);
        const vendor = await getVendorBySubdomain(subdomain);
        console.log('[API] Vendor found:', vendor);
        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }
        return NextResponse.json(vendor);
    }

    if (id) {
        const vendor = await getVendorById(id);
        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }
        return NextResponse.json(vendor);
    }

    return NextResponse.json({ error: 'Subdomain or ID required' }, { status: 400 });
}

// GET all vendors (debug)
export async function PATCH_DEBUG(request: NextRequest) {
    const vendors = await getVendors();
    return NextResponse.json({ vendors, cwd: process.cwd() });
}

// POST create new vendor
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, subdomain, whatsappNumber, upiId, address } = body;

        // Validate required fields
        if (!name || !subdomain || !whatsappNumber || !upiId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate subdomain format
        if (!validateSubdomain(subdomain)) {
            return NextResponse.json(
                { error: 'Invalid subdomain format' },
                { status: 400 }
            );
        }

        // Check if subdomain already exists
        const existing = await getVendorBySubdomain(subdomain);
        if (existing) {
            return NextResponse.json(
                { error: 'Subdomain already taken' },
                { status: 409 }
            );
        }

        // Create vendor
        const vendor = await createVendor({
            name,
            subdomain,
            whatsappNumber,
            upiId,
            address: address || '',
        });

        return NextResponse.json(vendor, { status: 201 });
    } catch (error) {
        console.error('Error creating vendor:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH update vendor
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, whatsappNumber, upiId, address } = body;

        if (!id) {
            return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
        }

        const vendor = await updateVendor(id, {
            ...(name && { name }),
            ...(whatsappNumber && { whatsappNumber }),
            ...(upiId && { upiId }),
            ...(address !== undefined && { address }),
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        return NextResponse.json(vendor);
    } catch (error) {
        console.error('Error updating vendor:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
