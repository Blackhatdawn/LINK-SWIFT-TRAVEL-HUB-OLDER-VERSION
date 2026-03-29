import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StayDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [stay, setStay] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/stays/my-stays', { headers: { Authorization: `Bearer ${user?.token}` } });
      const data = await res.json();
      if (data.success) {
        setStay((data.data || []).find((item: any) => item._id === id) || null);
      }
    };
    if (user?.token && id) void load();
  }, [user?.token, id]);

  if (!stay) return <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">Stay not found.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <Link to="/stays" className="text-amber-400">← Back to stays</Link>
      <h1 className="text-2xl font-semibold mt-4 mb-4">Stay Details</h1>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
        <p><strong>Property:</strong> {stay.property?.title || 'Property'}</p>
        <p><strong>Check-in:</strong> {new Date(stay.checkIn).toLocaleString()}</p>
        <p><strong>Check-out:</strong> {new Date(stay.checkOut).toLocaleString()}</p>
        <p><strong>Status:</strong> {stay.status}</p>
        <p><strong>Total:</strong> ₦{Number(stay.totalPrice || 0).toLocaleString('en-NG')}</p>
      </div>
    </div>
  );
}
