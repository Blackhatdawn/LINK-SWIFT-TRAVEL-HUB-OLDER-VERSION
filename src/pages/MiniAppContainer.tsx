import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldCheck, Star, Clock } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';

// Mock registry of mini-apps
const miniAppsRegistry: Record<string, any> = {
  pharmacy: {
    id: 'pharmacy',
    name: 'HealthPlus Pharmacy',
    category: 'Health & Wellness',
    rating: 4.8,
    deliveryTime: '30-45 mins',
    description: 'Order prescription medications and over-the-counter drugs with fast delivery.',
    theme: 'blue',
    products: [
      { id: 'p1', name: 'Paracetamol 500mg', price: 1500, image: '💊' },
      { id: 'p2', name: 'Vitamin C 1000mg', price: 3500, image: '🍊' },
      { id: 'p3', name: 'First Aid Kit', price: 12000, image: '🚑' },
      { id: 'p4', name: 'Cough Syrup', price: 2800, image: '🧪' },
    ]
  },
  events: {
    id: 'events',
    name: 'NaijaTix',
    category: 'Entertainment',
    rating: 4.9,
    deliveryTime: 'Instant E-Ticket',
    description: 'Discover and book tickets for the hottest concerts, comedy shows, and events.',
    theme: 'purple',
    products: [
      { id: 'e1', name: 'Afrobeats Festival 2026', price: 50000, image: '🎵' },
      { id: 'e2', name: 'Lagos Comedy Night', price: 15000, image: '🎤' },
      { id: 'e3', name: 'Tech Summit VIP', price: 100000, image: '💻' },
      { id: 'e4', name: 'Art Exhibition Entry', price: 5000, image: '🎨' },
    ]
  }
};

export default function MiniAppContainer() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { balance, payForService } = useWallet();
  const { user } = useAuth();
  
  const app = appId ? miniAppsRegistry[appId] : null;
  
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!app) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Mini-App Not Found</h2>
          <button onClick={() => navigate('/dashboard')} className="text-amber-400 hover:underline">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const cartTotal = Object.entries(cart).reduce((total, [id, quantity]) => {
    const product = app.products.find((p: any) => p.id === id);
    return total + (product ? (product.price as number) * (quantity as number) : 0);
  }, 0);

  const handleCheckout = async () => {
    if (cartTotal === 0) return;
    
    setIsCheckingOut(true);
    
    try {
      const paymentSuccess = await payForService(cartTotal, `miniapp-${app.id}`);
      
      if (!paymentSuccess) {
        alert('Insufficient wallet balance. Please add funds.');
        setIsCheckingOut(false);
        return;
      }
      
      const items = Object.entries(cart).map(([id, quantity]) => {
        const product = app.products.find((p: any) => p.id === id);
        return {
          productId: id,
          name: product?.name || id,
          price: product?.price || 0,
          quantity,
        };
      });

      const orderRes = await fetch('/api/miniapps/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ appId: app.id, appName: app.name, items, total: cartTotal }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Order creation failed');

      setCheckoutSuccess(true);
      
    } catch (error) {
      console.error('Checkout failed', error);
      alert('Checkout failed. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const themeColors: Record<string, string> = {
    blue: 'text-blue-400 border-blue-400/30 bg-blue-400/10 hover:bg-blue-400/20',
    purple: 'text-purple-400 border-purple-400/30 bg-purple-400/10 hover:bg-purple-400/20',
    amber: 'text-amber-400 border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20',
  };

  const themeColor = themeColors[app.theme] || themeColors.amber;

  if (checkoutSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-medium text-white mb-2">Order Confirmed!</h2>
          <p className="text-zinc-400 mb-8">
            Your payment of ₦{cartTotal.toLocaleString('en-NG')} was successful. {app.name} is processing your request.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      {/* Mini-App Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 -ml-2 rounded-full hover:bg-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div>
              <h1 className="text-lg font-medium text-white flex items-center gap-2">
                {app.name}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                  Mini-App
                </span>
              </h1>
              <p className="text-xs text-zinc-500">{app.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400" /> {app.rating}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {app.deliveryTime}</span>
            </div>
            <div className="text-sm font-medium bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              Wallet: <span className="text-white">₦{balance.toLocaleString('en-NG')}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* App Banner */}
        <div className={`rounded-2xl p-8 mb-8 border ${themeColor.split(' ')[1]} ${themeColor.split(' ')[2]}`}>
          <h2 className={`text-3xl font-light mb-2 ${themeColor.split(' ')[0]}`}>{app.name}</h2>
          <p className="text-zinc-300 max-w-xl">{app.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-medium text-white mb-6">Available Items</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {app.products.map((product: any) => (
                <div key={product.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:bg-zinc-900 transition-colors">
                  <div className="w-16 h-16 rounded-lg bg-zinc-800 flex items-center justify-center text-3xl shrink-0">
                    {product.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{product.name}</h4>
                    <p className="text-amber-400 text-sm font-medium">₦{product.price.toLocaleString('en-NG')}</p>
                  </div>
                  <button 
                    onClick={() => addToCart(product.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors shrink-0 ${themeColor}`}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-medium text-white mb-4">Your Order</h3>
              
              {Object.keys(cart).length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.entries(cart).map(([id, quantity]) => {
                      const product = app.products.find((p: any) => p.id === id);
                      if (!product) return null;
                      
                      return (
                        <div key={id} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-sm text-white truncate">{product.name}</p>
                            <p className="text-xs text-zinc-500">₦{product.price.toLocaleString('en-NG')} x {quantity}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                            <button 
                              onClick={() => removeFromCart(id)}
                              className="w-6 h-6 rounded flex items-center justify-center bg-zinc-800 text-zinc-300 hover:text-white"
                            >-</button>
                            <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                            <button 
                              onClick={() => addToCart(id)}
                              className="w-6 h-6 rounded flex items-center justify-center bg-zinc-800 text-zinc-300 hover:text-white"
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="border-t border-zinc-800 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-zinc-400">Subtotal</span>
                      <span className="text-white">₦{cartTotal.toLocaleString('en-NG')}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-zinc-400">Service Fee</span>
                      <span className="text-white">₦500</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-medium">
                      <span className="text-white">Total</span>
                      <span className="text-amber-400">₦{(cartTotal + 500).toLocaleString('en-NG')}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className={`w-full py-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${themeColor.split(' ')[2]} ${themeColor.split(' ')[0]} border ${themeColor.split(' ')[1]}`}
                  >
                    {isCheckingOut ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Pay with Wallet'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
