import { promises as fs } from 'fs';
import path from 'path';
import { Vendor, MenuItem } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const VENDORS_FILE = path.join(DATA_DIR, 'vendors.json');
const MENU_ITEMS_FILE = path.join(DATA_DIR, 'menu_items.json');

// Helper to read JSON file
async function readJSONFile<T>(filePath: string): Promise<T[]> {
    const absPath = path.resolve(filePath);
    console.log(`[DB] [${Date.now()}] Reading file:`, absPath);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        console.log(`[DB] [${Date.now()}] Successfully read ${parsed.length} items from ${absPath}`);
        return parsed;
    } catch (error) {
        console.error('[DB] Error reading file:', filePath, error);
        // If file doesn't exist, return empty array
        return [];
    }
}

// Helper to write JSON file (atomic write)
async function writeJSONFile<T>(filePath: string, data: T[]): Promise<void> {
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempPath, filePath);
}

// Vendor operations
export async function getVendors(): Promise<Vendor[]> {
    return readJSONFile<Vendor>(VENDORS_FILE);
}

export async function getVendorBySubdomain(subdomain: string): Promise<Vendor | null> {
    console.log('[DB] getVendorBySubdomain called with:', subdomain);
    const vendors = await getVendors();
    console.log('[DB] Total vendors in database:', vendors.length);
    console.log('[DB] Vendors:', vendors.map(v => ({ subdomain: v.subdomain, name: v.name })));
    const found = vendors.find((v) => v.subdomain === subdomain) || null;
    console.log('[DB] Found vendor:', found);
    return found;
}

export async function getVendorById(id: string): Promise<Vendor | null> {
    const vendors = await getVendors();
    return vendors.find((v) => v.id === id) || null;
}

export async function createVendor(vendorData: Omit<Vendor, 'id' | 'createdAt'>): Promise<Vendor> {
    const vendors = await getVendors();

    const newVendor: Vendor = {
        ...vendorData,
        id: `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
    };

    vendors.push(newVendor);
    await writeJSONFile(VENDORS_FILE, vendors);

    return newVendor;
}

export async function updateVendor(id: string, updates: Partial<Omit<Vendor, 'id' | 'subdomain' | 'createdAt'>>): Promise<Vendor | null> {
    const vendors = await getVendors();
    const index = vendors.findIndex((v) => v.id === id);

    if (index === -1) return null;

    vendors[index] = { ...vendors[index], ...updates };
    await writeJSONFile(VENDORS_FILE, vendors);

    return vendors[index];
}

// Menu item operations
export async function getMenuItems(vendorId?: string): Promise<MenuItem[]> {
    const items = await readJSONFile<MenuItem>(MENU_ITEMS_FILE);
    if (vendorId) {
        return items.filter((item) => item.vendorId === vendorId);
    }
    return items;
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
    const items = await getMenuItems();
    return items.find((item) => item.id === id) || null;
}

export async function createMenuItem(itemData: Omit<MenuItem, 'id' | 'createdAt'>): Promise<MenuItem> {
    const items = await getMenuItems();

    const newItem: MenuItem = {
        ...itemData,
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
    };

    items.push(newItem);
    await writeJSONFile(MENU_ITEMS_FILE, items);

    return newItem;
}

export async function updateMenuItem(id: string, updates: Partial<Omit<MenuItem, 'id' | 'vendorId' | 'createdAt'>>): Promise<MenuItem | null> {
    const items = await getMenuItems();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    await writeJSONFile(MENU_ITEMS_FILE, items);

    return items[index];
}

export async function deleteMenuItem(id: string): Promise<boolean> {
    const items = await getMenuItems();
    const filtered = items.filter((item) => item.id !== id);

    if (filtered.length === items.length) return false; // Item not found

    await writeJSONFile(MENU_ITEMS_FILE, filtered);
    return true;
}
