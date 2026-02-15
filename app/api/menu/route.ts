import { NextRequest, NextResponse } from 'next/server';
import {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuItemById,
} from '@/lib/db';

// GET menu items for a vendor
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
        return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });
    }

    const items = await getMenuItems(vendorId);
    return NextResponse.json(items);
}

// POST create menu item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { vendorId, name, price, category, isAvailable } = body;

        // Validate required fields
        if (!vendorId || !name || price === undefined || !category) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate price
        if (typeof price !== 'number' || price < 0) {
            return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
        }

        const item = await createMenuItem({
            vendorId,
            name,
            price,
            category,
            isAvailable: isAvailable ?? true,
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH update menu item
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, price, category, isAvailable } = body;

        if (!id) {
            return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
        }

        const item = await updateMenuItem(id, {
            ...(name && { name }),
            ...(price !== undefined && { price }),
            ...(category && { category }),
            ...(isAvailable !== undefined && { isAvailable }),
        });

        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error('Error updating menu item:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE menu item
export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const success = await deleteMenuItem(id);

    if (!success) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
