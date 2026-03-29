import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, ArrowLeft, MapPin, Calendar, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BookRide() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [carType, setCarType] = useState('Mercedes-Benz S-Class');
  
  // Bundle Stay State
  const [bundleStay, setBundleStay] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('The Ikoyi Penthouse');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/rides/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          pickup,
          dropoff,
          date,
          carType,
          bundleStay,
          ...(bundleStay && {
            property: selectedProperty,
            checkIn,
            checkOut
          })
        })
      });
      const data = await res.json();
      if (data.success) {
        navigate('/dashboard');
      } else {
        alert(data.message || 'Failed to book ride');
      }
    } catch (err) {
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-400/30">
      <header className="border-b border-amber-400/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Book a Luxury Ride</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-zinc-900/50 border border-amber-400/10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/20">
              <Car className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-light text-zinc-100">Schedule Chauffeur</h2>
              <p className="text-sm text-zinc-400">Premium rides across Nigeria</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Pickup Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-colors"
                    placeholder="E.g., Murtala Muhammed International Airport"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Dropoff Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-colors"
                    placeholder="E.g., Eko Hotels & Suites"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Date & Time</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-zinc-500" />
                  </div>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Vehicle Class</label>
                <select
                  value={carType}
                  onChange={(e) => setCarType(e.target.value)}
                  className="block w-full pl-3 pr-10 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-colors appearance-none"
                >
                  <option value="Mercedes-Benz S-Class">Mercedes-Benz S-Class</option>
                  <option value="Range Rover Autobiography">Range Rover Autobiography</option>
                  <option value="Rolls-Royce Phantom">Rolls-Royce Phantom</option>
                  <option value="Lexus LX 600">Lexus LX 600</option>
                </select>
              </div>
            </div>

            {/* Bundle Stay Section */}
            <div className="pt-6 border-t border-zinc-800/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                    <Home className="w-5 h-5 text-amber-400" /> Bundle a Stay
                  </h3>
                  <p className="text-sm text-zinc-400">Add a luxury property to your booking</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={bundleStay}
                    onChange={(e) => setBundleStay(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                </label>
              </div>

              {bundleStay && (
                <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Select Property</label>
                    <select
                      value={selectedProperty}
                      onChange={(e) => setSelectedProperty(e.target.value)}
                      className="block w-full pl-3 pr-10 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-colors appearance-none"
                    >
                      <option value="The Ikoyi Penthouse">The Ikoyi Penthouse</option>
                      <option value="Banana Island Villa">Banana Island Villa</option>
                      <option value="Maitama Luxury Apartment">Maitama Luxury Apartment</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Check-in Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input
                          type="date"
                          required={bundleStay}
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-colors [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Check-out Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-zinc-500" />
                        </div>
                        <input
                          type="date"
                          required={bundleStay}
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-zinc-800 rounded-xl bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-colors [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800/50">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-zinc-950 bg-amber-400 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-zinc-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
