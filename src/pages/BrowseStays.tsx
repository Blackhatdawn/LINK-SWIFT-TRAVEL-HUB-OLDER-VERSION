import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, MapPin, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Property {
  _id: string;
  title: string;
  description: string;
  location: { address: string };
  pricePerNight: number;
  images: string[];
  amenities: string[];
}

export default function BrowseStays() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/stays')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProperties(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch properties:', err);
        setLoading(false);
      });
  }, []);

  const handleBook = async (propertyId: string) => {
    try {
      const res = await fetch('/api/stays/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          propertyId,
          checkIn: new Date().toISOString(),
          checkOut: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
          chauffeurBundleIncluded: false
        })
      });
      const data = await res.json();
      if (data.success) {
        const paymentUrl = data?.payment?.authorization_url;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }
        navigate('/dashboard');
      } else {
        alert(data.message || 'Booking failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-400/30">
      <header className="border-b border-amber-400/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-full hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100">Browse Luxury Stays</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-400"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Home className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-2xl font-light text-zinc-300 mb-2">No properties available</h2>
            <p className="text-zinc-500">Check back later for new luxury stays.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map(property => (
              <div key={property._id} className="bg-zinc-900/50 border border-amber-400/10 rounded-2xl overflow-hidden hover:border-amber-400/30 transition-colors duration-300 group flex flex-col">
                <div className="h-48 bg-zinc-800 relative overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                      <Home className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-medium text-amber-400 border border-amber-400/20 flex items-center">
                    <Star className="w-3 h-3 mr-1 fill-amber-400" /> 4.9
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-medium text-zinc-100 mb-2">{property.title}</h3>
                  <p className="text-sm text-zinc-400 flex items-center mb-4">
                    <MapPin className="w-3.5 h-3.5 mr-1.5" /> {property.location.address}
                  </p>
                  <p className="text-sm text-zinc-500 line-clamp-2 mb-6 flex-grow">
                    {property.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                    <div>
                      <p className="text-sm text-zinc-400">Per night</p>
                      <p className="text-lg font-medium text-amber-400">₦{property.pricePerNight.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => handleBook(property._id)}
                      className="px-4 py-2 bg-zinc-100 text-zinc-950 font-medium rounded-lg hover:bg-white transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
