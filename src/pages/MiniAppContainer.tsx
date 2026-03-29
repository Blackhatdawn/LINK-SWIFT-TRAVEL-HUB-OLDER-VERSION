import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldCheck, Star, Clock } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';

export default function MiniAppContainer() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { balance, payForService } = useWallet();
  const { user } = useAuth();

  const [app, setApp] = useState<any | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!appId) return;
      try {
        const res = await fetch(`/api/miniapps/catalog/${appId}`);
        const data = await res.json();
        if (data.success) setApp(data.data);
      } catch (error) {
        console.error('Failed to fetch mini-app', error);
      } finally {
        setLoadingApp(false);
      }
    };

    void load();
  }, [appId]);

  if (loadingApp) {
    return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading mini-app...</div>;
  }

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

      const paymentSuccess = await payForService(cartTotal, 'miniapp', {
        orderId: orderData.data._id,
        reference: orderData.data.reference,
        appId: app.id,
      });

      if (!paymentSuccess) {
        alert('Insufficient wallet balance. Please add funds.');
        setIsCheckingOut(false);
        return;
      }

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
          <div className="text-sm text-zinc-400">
            Wallet: <span className="text-white font-medium">₦{balance.toLocaleString('en-NG')}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${themeColor}`}>{app.category}</span>
            <span className="flex items-center gap-1 text-sm text-zinc-400"><Star className="w-4 h-4 text-amber-400" /> {app.rating}</span>
            <span className="flex items-center gap-1 text-sm text-zinc-400"><Clock className="w-4 h-4" /> {app.deliveryTime}</span>
            <a href="#" className="ml-auto flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300">
              Visit Website <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <p className="text-zinc-300">{app.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-medium text-white mb-4">Available Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {app.products.map((product: any) => (
                <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl mb-2">{product.image}</p>
                    <h3 className="text-white font-medium">{product.name}</h3>
                    <p className="text-amber-400 font-medium mt-1">₦{product.price.toLocaleString('en-NG')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {cart[product.id] ? (
                      <>
                        <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 rounded bg-zinc-800 text-white">-</button>
                        <span className="w-8 text-center">{cart[product.id]}</span>
                        <button onClick={() => addToCart(product.id)} className="w-8 h-8 rounded bg-amber-400 text-zinc-950">+</button>
                      </>
                    ) : (
                      <button onClick={() => addToCart(product.id)} className="px-3 py-1.5 rounded bg-amber-400 text-zinc-950 text-sm font-medium">Add</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit sticky top-24">
            <h2 className="text-lg font-medium text-white mb-4">Your Cart</h2>
            {Object.keys(cart).length === 0 ? (
              <p className="text-zinc-500 text-sm">No items yet.</p>
            ) : (
              <div className="space-y-3 mb-6">
                {Object.entries(cart).map(([id, qty]) => {
                  const quantity = Number(qty);
                  const product = app.products.find((p: any) => p.id === id);
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-zinc-300">{product?.name} x {quantity}</span>
                      <span className="text-white">₦{((product?.price || 0) * quantity).toLocaleString('en-NG')}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-zinc-800 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Total</span>
                <span className="text-xl font-semibold text-white">₦{cartTotal.toLocaleString('en-NG')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cartTotal === 0 || isCheckingOut}
              className="w-full py-3 rounded-xl bg-amber-400 text-zinc-950 font-medium hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
