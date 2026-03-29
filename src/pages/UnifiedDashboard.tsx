import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Home, Calendar, Heart, ChevronRight, MapPin, Clock, User, Settings, LogOut, ChevronDown, X, Wallet, Package, Grid, ShieldAlert, CreditCard, Smartphone, Wifi, Tv, Droplets, Pill, Ticket, Send, Shield, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import NotificationDropdown from '../components/NotificationDropdown';

export default function UnifiedDashboard() {
  const { user, logout } = useAuth();
  const { balance, transactions } = useWallet();
  const navigate = useNavigate();
  
  // State to manage the currently active tab
  const [activeTab, setActiveTab] = useState<'rides' | 'stays' | 'upcoming' | 'wishlist' | 'wallet' | 'express' | 'miniapps' | 'safety'>('rides');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [selectedStay, setSelectedStay] = useState<any>(null);
  const [staySortOrder, setStaySortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferRecipient, setTransferRecipient] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const { addFunds, transferFunds } = useWallet();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleAddFunds = async () => {
    const amount = parseInt(addFundsAmount.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount <= 0) return;
    
    setIsAddingFunds(true);
    try {
      await addFunds(amount, 'Bank Transfer');
      setIsAddFundsModalOpen(false);
      setAddFundsAmount('');
    } catch (error) {
      console.error('Failed to add funds', error);
    } finally {
      setIsAddingFunds(false);
    }
  };

  const handleTransfer = async () => {
    const amount = parseInt(transferAmount.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount <= 0 || !transferRecipient) return;
    
    setIsTransferring(true);
    try {
      await transferFunds(amount, transferRecipient);
      setIsTransferModalOpen(false);
      setTransferAmount('');
      setTransferRecipient('');
    } catch (error) {
      console.error('Failed to transfer funds', error);
      alert('Transfer failed. Please check your balance.');
    } finally {
      setIsTransferring(false);
    }
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data for recent rides
  const recentRides = [
    {
      id: 'R-1045',
      date: 'Nov 15, 2026',
      pickup: 'Victoria Island',
      dropoff: 'Lekki Phase 1',
      status: 'Pending',
      fare: '₦30,000',
      car: 'Range Rover Autobiography',
    },
    {
      id: 'R-1042',
      date: 'Oct 12, 2026',
      pickup: 'Murtala Muhammed International Airport (LOS)',
      dropoff: 'Eko Hotels & Suites, Victoria Island',
      status: 'Completed',
      fare: '₦45,000',
      car: 'Mercedes-Benz S-Class',
    },
    {
      id: 'R-0988',
      date: 'Sep 28, 2026',
      pickup: 'Lekki Phase 1',
      dropoff: 'Ikoyi Club 1938',
      status: 'Cancelled',
      fare: '₦22,000',
      car: 'Range Rover Autobiography',
    }
  ];

  // Helper function for ride status badge styling
  const getStatusBadgeClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  // Mock data for recent stays
  const recentStays = [
    {
      id: 'S-4091',
      property: 'The Ikoyi Penthouse',
      dates: 'Nov 2 - Nov 5, 2026',
      checkIn: '2026-11-02 14:00',
      checkOut: '2026-11-05 11:00',
      status: 'Confirmed',
      price: '₦850,000',
      guests: 2,
      specialRequests: 'Late check-in requested. Champagne on arrival.',
      propertyAddress: '12 Bourdillon Road, Ikoyi, Lagos',
      hostContact: '+234 800 123 4567'
    },
    {
      id: 'S-3920',
      property: 'Banana Island Villa',
      dates: 'Oct 15 - Oct 18, 2026',
      checkIn: '2026-10-15 15:00',
      checkOut: '2026-10-18 12:00',
      status: 'Completed',
      price: '₦1,200,000',
      guests: 4,
      specialRequests: 'Extra pillows, airport transfer required.',
      propertyAddress: '101 Banana Island Road, Lagos',
      hostContact: '+234 800 987 6543'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-400/30">
      {/* Header Section */}
      <header className="border-b border-amber-400/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-amber-400 flex items-center justify-center text-zinc-950 font-bold text-xl">
              L
            </div>
            <span className="text-xl font-semibold tracking-tight text-zinc-100">
              LinkSwift <span className="text-amber-400 font-light">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden sm:flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors">
              <Home className="w-4 h-4" /> Home
            </Link>
            
            <NotificationDropdown />
            
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-zinc-400">Welcome back,</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-zinc-100">{user?.name || 'Guest'}</p>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-amber-400/30 flex items-center justify-center text-amber-400 font-medium">
                  {user?.name?.charAt(0) || 'G'}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-amber-400/20 rounded-xl shadow-lg py-1 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800 sm:hidden">
                    <p className="text-sm font-medium text-zinc-100">{user?.name || 'Guest'}</p>
                    <p className="text-xs text-zinc-400 truncate">{user?.email || 'guest@example.com'}</p>
                  </div>
                  {!user ? (
                    <>
                      <Link to="/login" className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 flex items-center gap-2 transition-colors">
                        <User className="w-4 h-4" /> Sign In
                      </Link>
                      <Link to="/signup" className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 flex items-center gap-2 transition-colors">
                        <User className="w-4 h-4" /> Create Account
                      </Link>
                    </>
                  ) : (
                    <>
                      <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 flex items-center gap-2 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 flex items-center gap-2 transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      <div className="border-t border-zinc-800 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Welcome & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-2">
              Your <span className="text-amber-400 font-medium">Luxury Travel</span> Dashboard
            </h1>
            <p className="text-zinc-400 max-w-xl">
              Manage your premium chauffeur rides and exclusive short-term rentals across Nigeria in one place.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to="/book-ride" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-amber-400 text-zinc-950 font-medium hover:bg-amber-300 transition-colors duration-200"
            >
              <Car className="w-4 h-4 mr-2" />
              Book New Ride
            </Link>
            <Link 
              to="/browse-stays" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-zinc-900 border border-amber-400/30 text-amber-400 font-medium hover:bg-zinc-800 transition-colors duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Browse Luxury Stays
            </Link>
          </div>
        </div>

        {/* Tab Navigation System */}
        <div className="border-b border-zinc-800 mb-8 overflow-x-auto hide-scrollbar">
          <nav className="flex space-x-8 min-w-max px-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('rides')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                activeTab === 'rides'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Car className="w-4 h-4" />
              My Rides
            </button>
            <button
              onClick={() => setActiveTab('stays')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                activeTab === 'stays'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Home className="w-4 h-4" />
              My Stays
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                activeTab === 'upcoming'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Upcoming Trips
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                activeTab === 'wishlist'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Heart className="w-4 h-4" />
              Wishlist
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                activeTab === 'wallet'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Wallet & Pay
            </button>
            <button
              onClick={() => setActiveTab('express')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                activeTab === 'express'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Package className="w-4 h-4" />
              Express Delivery
            </button>
            <button
              onClick={() => setActiveTab('miniapps')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                activeTab === 'miniapps'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Grid className="w-4 h-4" />
              Mini-Apps
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                activeTab === 'safety'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Shield className="w-4 h-4" />
              Safety Suite
            </button>
          </nav>
        </div>

        {/* Tab Content Area */}
        <div className="min-h-[400px]">
          
          {/* My Rides Tab Content */}
          {activeTab === 'rides' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium">Recent Rides</h2>
                <Link to="/rides" className="text-sm text-amber-400 hover:text-amber-300 flex items-center">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recentRides.map((ride) => (
                  <div key={ride.id} className="bg-zinc-900/50 backdrop-blur-sm border border-amber-400/10 rounded-xl p-6 hover:border-amber-400/30 transition-colors duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-2 ${getStatusBadgeClasses(ride.status)}`}>
                          {ride.status}
                        </span>
                        <p className="text-sm text-zinc-400 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1.5" /> {ride.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-zinc-100">{ride.fare}</p>
                        <p className="text-xs text-zinc-500">{ride.id}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                          <div className="w-0.5 h-8 bg-zinc-800 mx-auto my-1"></div>
                        </div>
                        <p className="text-sm text-zinc-300">{ride.pickup}</p>
                      </div>
                      <div className="flex items-start">
                        <div className="mt-1 mr-3 flex-shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 -ml-[3px]" />
                        </div>
                        <p className="text-sm text-zinc-300">{ride.dropoff}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                      <p className="text-sm text-zinc-400 flex items-center">
                        <Car className="w-4 h-4 mr-2 opacity-70" /> {ride.car}
                      </p>
                      <Link to={`/rides/${ride.id}`} className="text-sm font-medium text-amber-400 group-hover:text-amber-300 transition-colors">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Stays Tab Content */}
          {activeTab === 'stays' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-medium">Recent Stays</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
                    <span className="text-zinc-500 px-2 hidden sm:inline">Sort by Price:</span>
                    <button 
                      onClick={() => setStaySortOrder(prev => prev === 'asc' ? 'none' : 'asc')}
                      className={`px-3 py-1.5 rounded-md transition-colors ${staySortOrder === 'asc' ? 'bg-amber-400/10 text-amber-400 font-medium' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                    >
                      Low to High
                    </button>
                    <button 
                      onClick={() => setStaySortOrder(prev => prev === 'desc' ? 'none' : 'desc')}
                      className={`px-3 py-1.5 rounded-md transition-colors ${staySortOrder === 'desc' ? 'bg-amber-400/10 text-amber-400 font-medium' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                    >
                      High to Low
                    </button>
                  </div>
                  <Link to="/stays" className="text-sm text-amber-400 hover:text-amber-300 hidden sm:flex items-center">
                    View all <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...recentStays].sort((a, b) => {
                  if (staySortOrder === 'none') return 0;
                  const priceA = parseInt(a.price.replace(/[^\d]/g, ''), 10);
                  const priceB = parseInt(b.price.replace(/[^\d]/g, ''), 10);
                  return staySortOrder === 'asc' ? priceA - priceB : priceB - priceA;
                }).map((stay) => (
                  <div key={stay.id} className="bg-zinc-900/50 backdrop-blur-sm border border-amber-400/10 rounded-xl p-6 hover:border-amber-400/30 transition-colors duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-2">
                          {stay.status}
                        </span>
                        <h3 className="text-lg font-medium text-zinc-100">{stay.property}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-zinc-100">{stay.price}</p>
                        <p className="text-xs text-zinc-500">{stay.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6 text-sm text-zinc-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 opacity-70" />
                        {stay.dates}
                      </div>
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-1.5 opacity-70" />
                        {stay.guests} Guests
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                      <button className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
                        Download Receipt
                      </button>
                      <button 
                        onClick={() => setSelectedStay(stay)}
                        className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Empty state card to encourage booking */}
                <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                  <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                    <Home className="w-5 h-5 text-zinc-500" />
                  </div>
                  <h3 className="text-base font-medium text-zinc-300 mb-2">Looking for your next getaway?</h3>
                  <p className="text-sm text-zinc-500 mb-4 max-w-xs">
                    Discover our curated collection of luxury villas and penthouses across Nigeria.
                  </p>
                  <Link to="/browse-stays" className="text-sm font-medium text-amber-400 hover:text-amber-300">
                    Browse Luxury Stays &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Trips Tab Content */}
          {activeTab === 'upcoming' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-amber-400/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(251,191,36,0.05)]">
                <Calendar className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-2xl font-light text-zinc-100 mb-3 text-center">Your next trip is coming soon...</h2>
              <p className="text-zinc-400 text-center max-w-md mb-8">
                Combine a luxury stay with a premium chauffeur for the ultimate LinkSwift experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/book-ride" className="px-6 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm font-medium text-center">
                  Schedule a Ride
                </Link>
                <Link to="/browse-stays" className="px-6 py-2.5 rounded-lg bg-amber-400 text-zinc-950 hover:bg-amber-300 transition-colors text-sm font-medium text-center">
                  Book a Stay
                </Link>
              </div>
            </div>
          )}

          {/* Wishlist Tab Content */}
          {activeTab === 'wishlist' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-zinc-600" />
              </div>
              <h2 className="text-2xl font-light text-zinc-100 mb-3 text-center">Your wishlist is empty</h2>
              <p className="text-zinc-400 text-center max-w-md mb-8">
                Save your favorite luxury properties and frequent destinations here for quick access.
              </p>
              <Link to="/browse-stays" className="px-6 py-2.5 rounded-lg bg-zinc-900 border border-amber-400/30 text-amber-400 hover:bg-zinc-800 transition-colors text-sm font-medium text-center">
                Explore Properties
              </Link>
            </div>
          )}

          {/* Wallet Tab Content */}
          {activeTab === 'wallet' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-400/20 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  <div className="relative z-10">
                    <p className="text-zinc-400 text-sm mb-1">Total Balance</p>
                    <h2 className="text-4xl font-light text-white mb-6">
                      ₦{balance.toLocaleString('en-NG')}
                      <span className="text-lg text-zinc-500">.00</span>
                    </h2>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsAddFundsModalOpen(true)}
                        className="flex-1 bg-amber-400 text-zinc-950 py-2 rounded-lg font-medium text-sm hover:bg-amber-300 transition-colors"
                      >
                        Add Funds
                      </button>
                      <button 
                        onClick={() => setIsTransferModalOpen(true)}
                        className="flex-1 bg-zinc-800 text-white py-2 rounded-lg font-medium text-sm hover:bg-zinc-700 transition-colors border border-zinc-700"
                      >
                        Transfer
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Quick Payments</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { icon: Smartphone, label: 'Airtime & Data' },
                      { icon: Tv, label: 'Cable TV' },
                      { icon: Wifi, label: 'Internet' },
                      { icon: Droplets, label: 'Utilities' },
                    ].map((item, i) => (
                      <button key={i} className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-amber-400/30 hover:bg-zinc-900 transition-all group">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mb-3 group-hover:bg-amber-400/10 transition-colors">
                          <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-amber-400 transition-colors" />
                        </div>
                        <span className="text-xs font-medium text-zinc-300 text-center">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-white mb-4">Recent Transactions</h3>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                {transactions.length > 0 ? transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        {tx.type === 'credit' ? <ChevronDown className="w-5 h-5 rotate-180" /> : <Car className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{tx.title}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(tx.date).toLocaleDateString('en-NG', { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${tx.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString('en-NG')}
                    </span>
                  </div>
                )) : (
                  <div className="p-8 text-center text-zinc-500">
                    No recent transactions
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Express Delivery Tab Content */}
          {activeTab === 'express' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-amber-400/20 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-light text-white mb-2">LinkSwift <span className="text-amber-400 font-medium">Express</span></h2>
                  <p className="text-zinc-400 max-w-md">Premium parcel delivery for your important documents and packages. Track in real-time.</p>
                </div>
                <Link to="/book-express" className="px-6 py-3 bg-amber-400 text-zinc-950 rounded-lg font-medium hover:bg-amber-300 transition-colors whitespace-nowrap flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Package
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Standard Delivery', desc: 'Same-day delivery within the city.', icon: Package },
                  { title: 'Express Document', desc: 'Priority routing for sensitive documents.', icon: Send },
                  { title: 'Ride + Deliver', desc: 'Drop off a package during your ride.', icon: Car },
                ].map((service, i) => (
                  <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-amber-400/30 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4 group-hover:border-amber-400/50 transition-colors">
                      <service.icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">{service.title}</h3>
                    <p className="text-sm text-zinc-400">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini-Apps Tab Content */}
          {activeTab === 'miniapps' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-medium text-white mb-6">Partner Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { id: 'pharmacy', title: 'Pharmacy', desc: 'Meds delivered', icon: Pill, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
                  { id: 'events', title: 'Events', desc: 'VIP tickets', icon: Ticket, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
                  { id: null, title: 'Dining', desc: 'Private chefs', icon: Droplets, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
                  { id: null, title: 'More', desc: 'Coming soon', icon: Grid, color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-700' },
                ].map((app, i) => {
                  const Wrapper = app.id ? Link : 'div';
                  return (
                    <Wrapper 
                      key={i} 
                      to={app.id ? `/miniapp/${app.id}` : ''}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900 transition-colors cursor-pointer text-center group block"
                    >
                      <div className={`w-14 h-14 mx-auto rounded-full ${app.bg} ${app.border} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <app.icon className={`w-6 h-6 ${app.color}`} />
                      </div>
                      <h3 className="text-base font-medium text-white mb-1">{app.title}</h3>
                      <p className="text-xs text-zinc-500">{app.desc}</p>
                    </Wrapper>
                  );
                })}
              </div>
            </div>
          )}

          {/* Safety Suite Tab Content */}
          {activeTab === 'safety' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-gradient-to-r from-red-500/10 to-zinc-950 border border-red-500/20 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-light text-white mb-2">Advanced <span className="text-red-500 font-medium">Safety Suite</span></h2>
                  <p className="text-zinc-400 max-w-md">Your security is our top priority. Access emergency features, ride tracking, and family sharing.</p>
                </div>
                <button 
                  onClick={() => setIsSOSActive(true)}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors whitespace-nowrap flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  <ShieldAlert className="w-5 h-5" /> Trigger SOS
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Live Location Sharing</h3>
                    </div>
                    <div className="w-12 h-6 bg-amber-400 rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-zinc-950 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">Automatically share your ride details and live location with trusted contacts.</p>
                  <button className="text-sm text-amber-400 hover:underline">Manage Trusted Contacts</button>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Ride Audio Recording</h3>
                    </div>
                    <div className="w-12 h-6 bg-zinc-700 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-400 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">Record audio during your ride for added security. Recordings are encrypted and stored securely.</p>
                  <button className="text-sm text-amber-400 hover:underline">View Privacy Policy</button>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Enhanced Verification</h3>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md">Verified</span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">Your identity is verified. Drivers undergo strict background checks and facial recognition before every shift.</p>
                  <button className="text-sm text-amber-400 hover:underline">View Driver Standards</button>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                        <User className="w-5 h-5 text-rose-400" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Family Profiles</h3>
                    </div>
                    <button className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                      Invite
                    </button>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4">Link accounts with family members to pay for their rides and track their journeys in real-time.</p>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs text-zinc-400">JD</div>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs text-zinc-400">MD</div>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs text-zinc-400 border-dashed">+</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </main>

      {/* Floating SOS Button */}
      <button 
        onClick={() => setIsSOSActive(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-500 text-white rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center hover:bg-red-600 hover:scale-105 transition-all z-40"
        title="Emergency SOS"
      >
        <ShieldAlert className="w-6 h-6" />
      </button>

      {/* SOS Modal */}
      {isSOSActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm" 
            onClick={() => setIsSOSActive(false)}
          ></div>
          <div className="relative w-full max-w-md bg-zinc-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <ShieldAlert className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-2">Emergency SOS</h3>
              <p className="text-zinc-400 mb-8">
                This will immediately share your live location with trusted contacts and alert local authorities.
              </p>
              
              <div className="space-y-3">
                <button className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> Trigger SOS Now
                </button>
                <button 
                  onClick={() => setIsSOSActive(false)}
                  className="w-full py-3 bg-zinc-800 text-zinc-300 rounded-xl font-medium hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stay Details Modal */}
      {selectedStay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" 
            onClick={() => setSelectedStay(null)}
          ></div>
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div>
                <h3 className="text-xl font-medium text-zinc-100">Stay Details</h3>
                <p className="text-sm text-zinc-400 mt-1">Booking ID: {selectedStay.id}</p>
              </div>
              <button 
                onClick={() => setSelectedStay(null)}
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Property Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-light text-amber-400 mb-2">{selectedStay.property}</h4>
                  <div className="flex items-center text-zinc-400 text-sm">
                    <MapPin className="w-4 h-4 mr-1.5 opacity-70" />
                    {selectedStay.propertyAddress || 'Address not available'}
                  </div>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  {selectedStay.status}
                </span>
              </div>

              {/* Booking Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/50">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Check-in</p>
                  <div className="flex items-center text-zinc-200">
                    <Calendar className="w-4 h-4 mr-2 text-amber-400" />
                    {selectedStay.checkIn || selectedStay.dates.split(' - ')[0]}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Check-out</p>
                  <div className="flex items-center text-zinc-200">
                    <Calendar className="w-4 h-4 mr-2 text-amber-400" />
                    {selectedStay.checkOut || selectedStay.dates.split(' - ')[1]}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Guests</p>
                  <div className="flex items-center text-zinc-200">
                    <User className="w-4 h-4 mr-2 text-amber-400" />
                    {selectedStay.guests} Guests
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Total Price</p>
                  <div className="flex items-center text-zinc-200 font-medium">
                    {selectedStay.price}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedStay.specialRequests && (
                <div>
                  <h5 className="text-sm font-medium text-zinc-300 mb-2">Special Requests & Notes</h5>
                  <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-800/50 text-sm text-zinc-400">
                    {selectedStay.specialRequests}
                  </div>
                </div>
              )}

              {/* Host Contact */}
              {selectedStay.hostContact && (
                <div>
                  <h5 className="text-sm font-medium text-zinc-300 mb-2">Host Contact</h5>
                  <div className="flex items-center text-sm text-zinc-400">
                    <Clock className="w-4 h-4 mr-2 opacity-70" />
                    {selectedStay.hostContact}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedStay(null)}
                className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
              >
                Close
              </button>
              <button className="px-5 py-2.5 text-sm font-medium bg-amber-400 text-zinc-950 rounded-lg hover:bg-amber-500 transition-colors">
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {isAddFundsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" 
            onClick={() => setIsAddFundsModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-xl font-medium text-white">Add Funds</h3>
              <button 
                onClick={() => setIsAddFundsModalOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₦</span>
                  <input 
                    type="text" 
                    value={addFundsAmount}
                    onChange={(e) => {
                      // Only allow numbers and format with commas
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val) {
                        setAddFundsAmount(parseInt(val, 10).toLocaleString('en-NG'));
                      } else {
                        setAddFundsAmount('');
                      }
                    }}
                    placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-white font-medium focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[5000, 10000, 50000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAddFundsAmount(amt.toLocaleString('en-NG'))}
                    className="py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    +₦{amt.toLocaleString('en-NG')}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={handleAddFunds}
                disabled={isAddingFunds || !addFundsAmount}
                className="w-full py-4 bg-amber-400 text-zinc-950 rounded-xl font-medium hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isAddingFunds ? (
                  <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" 
            onClick={() => setIsTransferModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-xl font-medium text-white">Transfer Funds</h3>
              <button 
                onClick={() => setIsTransferModalOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Recipient (Email or Phone)</label>
                <input 
                  type="text" 
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="Enter recipient details"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white font-medium focus:outline-none focus:border-amber-400/50 transition-colors"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Amount (₦)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₦</span>
                  <input 
                    type="text" 
                    value={transferAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val) {
                        setTransferAmount(parseInt(val, 10).toLocaleString('en-NG'));
                      } else {
                        setTransferAmount('');
                      }
                    }}
                    placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-white font-medium focus:outline-none focus:border-amber-400/50 transition-colors"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Available Balance: ₦{balance.toLocaleString('en-NG')}
                </p>
              </div>
              
              <button 
                onClick={handleTransfer}
                disabled={isTransferring || !transferAmount || !transferRecipient}
                className="w-full py-4 bg-amber-400 text-zinc-950 rounded-xl font-medium hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isTransferring ? (
                  <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Send Funds'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
