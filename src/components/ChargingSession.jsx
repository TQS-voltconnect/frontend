import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlayIcon, 
  StopIcon, 
  ClockIcon, 
  LightningBoltIcon,
  CreditCardIcon,
  CashIcon,
  DeviceMobileIcon
} from '@heroicons/react/outline';
import { baseUrl } from '../consts';


const ChargingSession = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CARD');

  // Add debug logging
  useEffect(() => {
    console.log('API Base URL:', baseUrl);
    console.log('Reservation ID:', reservationId);
  }, [baseUrl, reservationId]);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await fetch(`${baseUrl}/reservations/${reservationId}`);
        if (!response.ok) throw new Error('Failed to fetch reservation');
        const data = await response.json();
        setReservation(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReservation();
  }, [reservationId]);

  const startCharging = async () => {
    try {
      setError(null);
      const url = `${baseUrl}/reservations/${reservationId}/start`;
      console.log('Starting charging session:', { reservationId, url });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Charging start error response:', errorData);
        throw new Error(errorData.message || `Failed to start charging. Status: ${response.status}`);
      }

      const updatedReservation = await response.json();
      console.log('Charging started successfully:', updatedReservation);
      setReservation(updatedReservation);
    } catch (err) {
      console.error('Error starting charging:', err);
      setError(err.message);
    }
  };

  const stopCharging = async () => {
    try {
      const response = await fetch(`${baseUrl}/reservations/${reservationId}/stop`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to stop charging');
      const updatedReservation = await response.json();
      setReservation(updatedReservation);
    } catch (err) {
      setError(err.message);
    }
  };

  const proceedToPayment = async () => {
    try {
      const response = await fetch(`${baseUrl}/reservations/${reservationId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethod: selectedPaymentMethod })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }

      const updatedReservation = await response.json();
      setReservation(updatedReservation);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!reservation) return <div className="text-center py-8">Reservation not found</div>;

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">
            Charging Details
          </h2>
          <p className="text-gray-600">
            Reservation #{reservation.id}
          </p>
          <div className="mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium 
            {reservation.status === 'SCHEDULED' ? 'bg-emerald-100 text-emerald-800' :
             reservation.status === 'CHARGING' ? 'bg-blue-100 text-blue-800' :
             reservation.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
             reservation.status === 'PAID' ? 'bg-green-100 text-green-800' :
             reservation.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
             'bg-gray-100 text-gray-800'}">
            {reservation.status}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-gray-600 mb-2">Scheduled Start</div>
              <div className="text-lg font-medium">{formatDate(reservation.startTime)}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-gray-600 mb-2">Duration</div>
              <div className="text-lg font-medium">{reservation.chargingTime} minutes</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-gray-600 mb-2">Price</div>
              <div className="text-lg font-medium">€{reservation.price?.toFixed(2) || '0.00'}</div>
            </div>
            {reservation.status !== 'SCHEDULED' && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 mb-2">Energy Consumed</div>
                  <div className="text-lg font-medium">
                    {reservation.energyConsumed?.toFixed(2) || '0.00'} kWh
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 mb-2">Charging Start</div>
                  <div className="text-lg font-medium">{formatDate(reservation.chargingStartTime)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 mb-2">Charging End</div>
                  <div className="text-lg font-medium">{formatDate(reservation.chargingEndTime)}</div>
                </div>
              </>
            )}
            {reservation.isPaid && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-gray-600 mb-2">Payment Method</div>
                <div className="text-lg font-medium">{reservation.paymentMethod}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {reservation.status === 'SCHEDULED' && (
              <button
                onClick={startCharging}
                className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Start Charging
              </button>
            )}

            {reservation.status === 'CHARGING' && (
              <button
                onClick={stopCharging}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <StopIcon className="h-5 w-5 mr-2" />
                Stop Charging
              </button>
            )}

            {reservation.status === 'COMPLETED' && !reservation.isPaid && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-600 mb-2">Payment Method</div>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="CARD">Credit/Debit Card</option>
                    <option value="CASH">Cash</option>
                    <option value="MOBILE">Mobile Payment</option>
                  </select>
                </div>
                <button
                  onClick={proceedToPayment}
                  className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Pay €{reservation.price?.toFixed(2)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargingSession; 