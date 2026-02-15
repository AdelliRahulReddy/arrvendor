import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Digital Menu,
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Perfect for street vendors, cafes, and small restaurants. Get your QR menu online in minutes.
          </p>

          <Link
            href="/signup"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Start Your Digital Menu Free
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">QR Code Menu</h3>
            <p className="text-gray-600">
              Customers scan your QR code to view your menu instantly. No app download needed.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Orders</h3>
            <p className="text-gray-600">
              Customers click to send orders directly to your WhatsApp with order details.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">UPI Payments</h3>
            <p className="text-gray-600">
              Generate UPI payment links instantly. Customers pay with one tap.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Sign Up & Add Menu</h4>
                <p className="text-gray-600">Create your account and add your menu items with prices.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Download Your QR Code</h4>
                <p className="text-gray-600">Get your unique QR code and print it for your shop.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Start Receiving Orders</h4>
                <p className="text-gray-600">Customers scan, browse, and order via WhatsApp or pay via UPI.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-24 text-center">
          <Link
            href="/signup"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
