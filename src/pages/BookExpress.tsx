import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Navigation, Clock, Shield, CheckCircle2, Car } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';

export default function BookExpress() {
  const navigate = useNavigate();
  const { balance, payForService } = useWallet();
  const { user } = useAuth();
  
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [packageType, setPackageType] = useState('document');
  const [weight, setWeight] = useState('0-5kg');
  const [instructions, setInstructions] = useState('');
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const calculatePrice = async () => {
    if (!pickup || !dropoff) return;

    setIsCalculating(true);
    try {
      const res = await fetch('/api/express/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ pickup, dropoff, packageType, weight }),
      });
      const data = await res.json();
      if (data.success) setPrice(data.data.price);
    } catch (error) {
      console.error('Quote failed', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleBook = async () => {
    if (!price) return;
    
    setIsBooking(true);
    
    try {
      const orderRes = await fetch('/api/express/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ pickup, dropoff, packageType, weight, instructions, price }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Order creation failed');

      const paid = await payForService(price, 'express', { orderId: orderData.data._id, reference: orderData.data.reference });
      if (!paid) throw new Error('Insufficient wallet balance. Please add funds.');
      setBookingSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Booking failed', error);
      alert('Failed to book delivery. Please try again.');
      setIsBooking(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-medium text-white mb-2">Delivery Scheduled!</h2>
          <p className="text-zinc-400 mb-8">
            Your courier is on the way to pick up the package. You can track the delivery in your dashboard.
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-amber-400/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 -ml-2 mr-2 rounded-full hover:bg-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <h1 className="text-lg font-medium text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              LinkSwift Express
            </h1>
          </div>
          <div className="text-sm font-medium text-zinc-400">
            Wallet: <span className="text-white">₦{balance.toLocaleString('en-NG')}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-medium text-white mb-6">Delivery Details</h2>
          
          <div className="space-y-6">
            {/* Locations */}
            <div className="relative">
              <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-zinc-800"></div>
              
              <div className="relative flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 z-10">
                  <MapPin className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Pickup Location</label>
                  <input 
                    type="text" 
                    value={pickup}
                    onChange={(e) => {
                      setPickup(e.target.value);
                      setPrice(null);
                    }}
                    placeholder="Enter pickup address"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>
              </div>
              
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 z-10">
                  <Navigation className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Drop-off Location</label>
                  <input 
                    type="text" 
                    value={dropoff}
                    onChange={(e) => {
                      setDropoff(e.target.value);
                      setPrice(null);
                    }}
                    placeholder="Enter destination address"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-800 my-6"></div>

            {/* Package Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Package Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setPackageType('document'); setPrice(null); }}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                      packageType === 'document' 
                        ? 'bg-amber-400/10 border-amber-400 text-amber-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    Document
                  </button>
                  <button 
                    onClick={() => { setPackageType('parcel'); setPrice(null); }}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                      packageType === 'parcel' 
                        ? 'bg-amber-400/10 border-amber-400 text-amber-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    Small Parcel
                  </button>
                  <button 
                    onClick={() => { setPackageType('large'); setPrice(null); }}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors col-span-2 ${
                      packageType === 'large' 
                        ? 'bg-amber-400/10 border-amber-400 text-amber-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    Large Item / E-commerce
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Estimated Weight</label>
                <select 
                  value={weight}
                  onChange={(e) => { setWeight(e.target.value); setPrice(null); }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-400/50 transition-colors appearance-none"
                >
                  <option value="0-5kg">0 - 5 kg</option>
                  <option value="5-15kg">5 - 15 kg</option>
                  <option value="15kg+">15 kg +</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Delivery Instructions (Optional)</label>
              <textarea 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="E.g., Fragile item, leave at reception..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-400/50 transition-colors resize-none"
              ></textarea>
            </div>
            
            {!price ? (
              <button 
                onClick={calculatePrice}
                disabled={!pickup || !dropoff || isCalculating}
                className="w-full py-4 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isCalculating ? (
                  <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Calculate Delivery Fee'
                )}
              </button>
            ) : (
              <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">Estimated Fee</p>
                    <p className="text-3xl font-medium text-white">₦{price.toLocaleString('en-NG')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 text-sm mb-1">Estimated Time</p>
                    <p className="text-lg font-medium text-white">45 - 60 mins</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 mb-6 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                  <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Secure Delivery Guarantee</p>
                    <p className="text-xs text-zinc-500 mt-1">Your package is insured up to ₦50,000 against loss or damage.</p>
                  </div>
                </div>

                <button 
                  onClick={handleBook}
                  disabled={isBooking}
                  className="w-full py-4 bg-amber-400 text-zinc-950 rounded-xl font-medium hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isBooking ? (
                    <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Confirm & Pay from Wallet'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
