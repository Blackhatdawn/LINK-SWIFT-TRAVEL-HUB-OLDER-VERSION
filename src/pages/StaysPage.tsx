import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StaysPage() {
  const { user } = useAuth();
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/stays/my-stays', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        if (data.success) setStays(data.data || []);
      } catch (error) {
        console.error('Failed to load stays', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) void load();
  }, [user?.token]);

  if (loading) return <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">Loading stays...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <h1 className="text-2xl font-semibold mb-6">My Stays</h1>
      <div className="space-y-4">
        {stays.length === 0 && <p className="text-zinc-400">No stays found.</p>}
        {stays.map((stay) => (
          <Link key={stay._id} to={`/stays/${stay._id}`} className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-amber-400/40">
            <p className="font-medium">{stay.property?.title || 'Property'}</p>
            <p className="text-zinc-400 text-sm">{new Date(stay.checkIn).toLocaleDateString()} - {new Date(stay.checkOut).toLocaleDateString()}</p>
            <p className="text-zinc-500 text-xs mt-1">Status: {stay.status}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
