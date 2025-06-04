import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, LocationMarkerIcon, LightningBoltIcon } from '@heroicons/react/outline';
import { baseUrl } from '../consts';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${baseUrl}/reservations`);
        const reservations = await res.json();

        const detailedBookings = await Promise.all(
          reservations.map(async (reservation) => {
            const [stationRes, chargerRes, vehicleRes] = await Promise.all([
              fetch(`${baseUrl}/stations/${reservation.chargingStationId}`),
              fetch(`${baseUrl}/chargers/${reservation.chargerId}`),
              fetch(`${baseUrl}/vehicles/${reservation.vehicleId}`)
            ]);

            const [station, charger, vehicle] = await Promise.all([
              stationRes.json(),
              chargerRes.json(),
              vehicleRes.json()
            ]);

            const startDateTime = new Date(reservation.startTime);

            return {
              ...reservation,
              date: startDateTime.toLocaleDateString(),
              time: startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              stationCity: station.city,
              chargerType: charger.chargerType,
              chargerSpeed: charger.chargingSpeed,
              vehicleBrand: vehicle.brand,
              vehicleModel: vehicle.model,
              vehicleYear: vehicle.release_year,
              vehicleImage: vehicle.image_url,
              startTime: reservation.startTime 
            };
          })
        );

        setBookings(detailedBookings);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again later.');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const cancelReservation = async (reservationId) => {
    try {
      // Encontra a reserva atual
      const booking = bookings.find(b => b.id === reservationId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Verifica se a reserva pode ser cancelada
      if (booking.status !== 'SCHEDULED') {
        throw new Error('Only scheduled reservations can be cancelled');
      }

      const response = await fetch(`${baseurl}/reservations/${reservationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to cancel reservation');
      }

      // Remove a reserva cancelada da lista
      setBookings(bookings.filter(booking => booking.id !== reservationId));
      setError(null); // Limpa qualquer erro anterior
      setSuccessMessage('Reservation cancelled successfully');
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      setSuccessMessage(null);
      console.error('Error canceling reservation:', err);
    }
  };

  const getBookingStatus = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    
    // Primeiro verifica o status real da reserva
    switch (booking.status) {
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          color: 'bg-red-100 text-red-800',
          action: null,
          canCancel: false
        };
      case 'CHARGING':
        return {
          label: 'Charging',
          color: 'bg-blue-100 text-blue-800',
          action: () => navigate(`/charging-session/${booking.id}`),
          canCancel: false
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          color: 'bg-purple-100 text-purple-800',
          action: () => navigate(`/charging-session/${booking.id}`),
          canCancel: false
        };
      case 'PAID':
        return {
          label: 'Paid',
          color: 'bg-green-100 text-green-800',
          action: () => navigate(`/charging-session/${booking.id}`),
          canCancel: false
        };
      case 'SCHEDULED':
        if (startTime > now) {
          return {
            label: 'Scheduled',
            color: 'bg-emerald-100 text-emerald-800',
            action: () => navigate(`/charging-session/${booking.id}`),
            canCancel: true
          };
        }

        const tolerancePeriod = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
        if (now <= tolerancePeriod) {
          return {
            label: 'Ready to Start',
            color: 'bg-yellow-100 text-yellow-800',
            action: () => navigate(`/charging-session/${booking.id}`),
            canCancel: true
          };
        }

        return {
          label: 'Expired',
          color: 'bg-gray-100 text-gray-800',
          action: null,
          canCancel: false
        };

      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          action: null,
          canCancel: false
        };
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading bookings...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (bookings.length === 0) return <div className="text-center py-8 text-gray-500 text-lg">No bookings found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold mb-8 text-emerald-700">My Charging Bookings</h2>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      <ul className="space-y-6">
        {bookings.map((booking) => {
          const status = getBookingStatus(booking);
          
          return (
            <li
              key={booking.id}
              className="border border-gray-200 rounded-lg shadow-sm p-6 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {booking.stationCity} Charging Station
                  </h3>
                  
                  <div className="flex items-center text-gray-500">
                    <LocationMarkerIcon className="h-4 w-4 mr-1" />
                    <span>{booking.date} {booking.time}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <LightningBoltIcon className="h-4 w-4 mr-1" />
                    <span>{booking.chargerType} • {booking.chargerSpeed} kW</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {status.action && (
                      <button
                        onClick={status.action}
                        className="text-sm text-emerald-600 hover:text-emerald-700"
                      >
                        {booking.status === 'SCHEDULED' && status.label === 'Ready to Start' 
                          ? 'Start Charging'
                          : booking.status === 'CHARGING' 
                          ? 'View Charging'
                          : booking.status === 'COMPLETED' || booking.status === 'PAID'
                          ? 'View Details'
                          : 'View Booking'}
                      </button>
                    )}
                    {status.canCancel && (
                      <button
                        onClick={() => cancelReservation(booking.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Cancel Reservation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MyBookings;
