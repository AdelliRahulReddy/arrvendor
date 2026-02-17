# ArrVendor 🚀

ArrVendor is a modern, multi-tenant platform designed for street vendors and small business owners to digitize their menus and receive orders effortlessly.

## ✨ Features

- 🏢 **Multi-Tenancy**: Every vendor gets their own unique subdomain (e.g., `vendor.localhost:3000`).
- 📊 **Vendor Dashboard**: 
  - **Overview**: Track menu items and download your unique QR code.
  - **Menu Management**: Easily add, edit, or remove items with availability toggles.
  - **Settings**: Manage shop details, WhatsApp numbers, and UPI IDs.
- 📱 **Premium Customer View**:
  - High-end, mobile-responsive UI with glassmorphism and smooth animations.
  - Category-based filtering.
  - One-click **Order via WhatsApp**.
  - Integrated **Pay via UPI**.
- 🖼️ **Image Support**: High-quality product images for a professional look.
- 💾 **JSON Persistence**: Lightweight and fast data storage using local JSON files.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **QR Codes**: [react-qr-code](https://www.npmjs.com/package/react-qr-code)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AdelliRahulReddy/arrvendor.git
   cd arrvendor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Access the application:
   - **Main Site**: [http://localhost:3000](http://localhost:3000)
   - **Demo Vendor Dashboard**: [http://rahulreddy-adelli.localhost:3000/dashboard](http://rahulreddy-adelli.localhost:3000/dashboard)
   - **Demo Customer View**: [http://rahulreddy-adelli.localhost:3000](http://rahulreddy-adelli.localhost:3000)

## 📝 License

Distributed under the MIT License.
