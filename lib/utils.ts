/**
 * Utility functions for the application
 */

/**
 * Generate subdomain from vendor name
 * "Ram's Cafe" -> "rams-cafe"
 */
export function generateSubdomain(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Remove consecutive hyphens
}

/**
 * Validate subdomain format (alphanumeric + hyphens only)
 */
export function validateSubdomain(subdomain: string): boolean {
    const regex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return regex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 50;
}

/**
 * Format WhatsApp order message
 */
export function formatWhatsAppOrder(
    items: Array<{ name: string; price: number; quantity: number }>,
    vendor: { name: string }
): string {
    const itemsList = items
        .map((item) => `${item.quantity} x ${item.name} (₹${item.price})`)
        .join('\n');

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return `Hi, I would like to order from ${vendor.name}:\n\n${itemsList}\n\nTotal: ₹${total}`;
}

/**
 * Generate WhatsApp link
 */
export function generateWhatsAppLink(phoneNumber: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

/**
 * Generate UPI payment link
 */
export function generateUpiLink(upiId: string, shopName: string, amount: number): string {
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR`;
}

/**
 * Extract subdomain from hostname
 * Returns null for main domain or www subdomain
 */
export function extractSubdomain(hostname: string, mainDomain: string): string | null {
    // Remove port if present
    const host = hostname.split(':')[0];

    // Check if it's strictly localhost or an IP
    if (host === 'localhost' || host === '127.0.0.1') {
        return null;
    }

    // For localhost:3000 pattern (e.g., vendor.localhost)
    if (host.endsWith('.localhost')) {
        const subdomain = host.replace('.localhost', '');
        return subdomain === 'www' ? null : subdomain;
    }

    // For production domain or generic pattern
    const domain = mainDomain.split(':')[0];
    if (host === domain || host === `www.${domain}`) {
        return null;
    }

    if (host.endsWith(`.${domain}`)) {
        const subdomain = host.replace(`.${domain}`, '');
        return subdomain === 'www' ? null : subdomain;
    }

    return null;
}
