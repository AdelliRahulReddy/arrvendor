export interface Vendor {
  id: string;
  name: string;
  subdomain: string;
  whatsappNumber: string;
  upiId: string;
  address: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
