import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RideDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [ride, setRide] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/rides/my-rides', { headers: { Authorization: `Bearer ${user?.token}` } });
      const data = await res.json();
      if (data.success) {
        setRide((data.data || []).find((item: any) => item._id === id) || null);
      }
    };
    if (user?.token && id) void load();
  }, [user?.token, id]);

  if (!ride) return <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">Ride not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <Link to="/rides" className="text-amber-400">← Back to rides</Link>
      <h1 className="text-2xl font-semibold mt-4 mb-4">Ride Details</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
        <p><strong>Car:</strong> {ride.carType}</p>
        <p><strong>Pickup:</strong> {ride.pickup?.address}</p>
        <p><strong>Dropoff:</strong> {ride.dropoff?.address}</p>
        <p><strong>Status:</strong> {ride.status}</p>
        <p><strong>Fare:</strong> ₦{Number(ride.fare || 0).toLocaleString('en-NG')}</p>
      </div>
    </div>
  );
}
