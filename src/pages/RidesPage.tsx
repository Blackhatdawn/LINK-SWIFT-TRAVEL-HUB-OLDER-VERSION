import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RidesPage() {
  const { user } = useAuth();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/rides/my-rides', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        if (data.success) setRides(data.data || []);
      } catch (error) {
        console.error('Failed to load rides', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) void load();
  }, [user?.token]);

  if (loading) return <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">Loading rides...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <h1 className="text-2xl font-semibold mb-6">My Rides</h1>
      <div className="space-y-4">
        {rides.length === 0 && <p className="text-zinc-400">No rides found.</p>}
        {rides.map((ride) => (
          <Link key={ride._id} to={`/rides/${ride._id}`} className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-amber-400/40">
            <p className="font-medium">{ride.carType}</p>
            <p className="text-zinc-400 text-sm">{ride.pickup?.address} → {ride.dropoff?.address}</p>
            <p className="text-zinc-500 text-xs mt-1">Status: {ride.status}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
