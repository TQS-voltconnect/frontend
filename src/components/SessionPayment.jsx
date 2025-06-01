import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCardIcon, CheckCircleIcon } from '@heroicons/react/outline';

const SessionPayment = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const baseurl = import.meta.env.VITE_API_URL_LOCAL;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`${baseurl}/charging-sessions/${sessionId}`);
        if (!response.ok) throw new Error('Failed to fetch session');
        const data = await response.json();
        setSession(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const handlePayment = async () => {
    try {
      const response = await fetch(`${baseurl}/charging-sessions/${sessionId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          amount: session.totalCost,
          currency: 'EUR'
        })
      });

      if (!response.ok) throw new Error('Payment failed');
      
      setPaymentSuccess(true);
      setTimeout(() => {
        navigate('/my-sessions');
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Thank you for using our service.</p>
          <p className="text-sm text-gray-500 mt-4">Redirecting to your sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Details</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{session.duration}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Energy Consumed</span>
              <span className="font-medium">{session.energyConsumed.toFixed(2)} kWh</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rate</span>
              <span className="font-medium">€{session.rate.toFixed(2)}/kWh</span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-semibold">€{session.totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-gray-700 font-medium mb-3">Payment Method</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio text-emerald-600"
                />
                <span>Credit/Debit Card</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="payment"
                  value="mbway"
                  checked={paymentMethod === 'mbway'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio text-emerald-600"
                />
                <span>MB WAY</span>
              </label>
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 flex items-center justify-center"
          >
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Pay €{session.totalCost.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionPayment; 