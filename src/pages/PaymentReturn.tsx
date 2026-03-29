import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PaymentReturn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reference = params.get('reference') || '';
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    let timer: any;

    const check = async () => {
      if (!reference) {
        setStatus('failed');
        setMessage('Missing payment reference.');
        return;
      }

      try {
        const res = await fetch(`/api/payments/status/${reference}`, {
          headers: {
            Authorization: `Bearer ${user?.token || ''}`,
          },
        });

        const data = await res.json();
        if (!data.success) {
          setStatus('pending');
          setMessage('Waiting for payment confirmation...');
          timer = setTimeout(check, 3000);
          return;
        }

        if (data.data.status === 'Confirmed') {
          setStatus('success');
          setMessage('Payment confirmed successfully.');
          return;
        }

        if (data.data.status === 'Cancelled') {
          setStatus('failed');
          setMessage('Payment was cancelled.');
          return;
        }

        setStatus('pending');
        setMessage('Waiting for payment confirmation...');
        timer = setTimeout(check, 3000);
      } catch (error) {
        setStatus('pending');
        setMessage('Could not confirm yet, retrying...');
        timer = setTimeout(check, 4000);
      }
    };

    void check();

    return () => clearTimeout(timer);
  }, [reference, user?.token]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-semibold mb-3">Payment Status</h1>
        <p className="text-zinc-400 mb-4">Reference: {reference || 'N/A'}</p>
        <p className="text-lg mb-8">{message}</p>

        {status === 'pending' && <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full mx-auto" />}

        {status !== 'pending' && (
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 rounded-xl bg-amber-400 text-zinc-950 font-medium hover:bg-amber-300 transition-colors"
          >
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
