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
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);


  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${baseUrl}/reservations`);
        const reservations = await res.json();
        const detailedBookingsRaw = await Promise.all(
          reservations.map(async (reservation) => {
            try {
              const [stationRes, chargerRes, vehicleRes] = await Promise.all([
                fetch(`${baseUrl}/stations/${reservation.chargingStationId}`),
                fetch(`${baseUrl}/chargers/${reservation.chargerId}`),
                fetch(`${baseUrl}/vehicles/${reservation.vehicleId}`)
              ]);

              if (!stationRes.ok || !chargerRes.ok || !vehicleRes.ok) {
                throw new Error(`Failed to fetch details for reservation ID ${reservation.id}`);
              }

              const [station, charger, vehicle] = await Promise.all([
                stationRes.json(),
                chargerRes.json(),
                vehicleRes.json()
              ]);

              const startDateTime = new Date(reservation.startTime);

              return {
                ...reservation,
date: startDateTime.toLocaleDateString('en-GB', { timeZone: 'Europe/Lisbon' }),
time: startDateTime.toLocaleTimeString('en-GB', {
  timeZone: 'Europe/Lisbon',
  hour: '2-digit',
  minute: '2-digit'
}),

                stationCity: station.city,
                chargerType: charger.chargerType,
                chargerSpeed: charger.chargingSpeed,
                vehicleBrand: vehicle.brand,
                vehicleModel: vehicle.model,
                vehicleYear: vehicle.release_year,
                vehicleImage: vehicle.image_url,
                startTime: reservation.startTime
              };
            } catch (err) {
              console.error(`Erro ao processar reserva ${reservation.id}:`, err);
              return null;
            }
          })
        );

        const detailedBookings = detailedBookingsRaw.filter(b => b !== null);
        setBookings(detailedBookings);


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
      const booking = bookings.find(b => b.id === reservationId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'SCHEDULED') {
        throw new Error('Only scheduled reservations can be cancelled');
      }

      const response = await fetch(`${baseUrl}/reservations/${reservationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to cancel reservation');
      }
      setSuccessMessage('Reservation cancelled successfully');

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      setSuccessMessage(null);
      console.error('Error canceling reservation:', err);
    }
  };

  const submitReview = async (stationId) => {
    try {
      const response = await fetch(`${baseUrl}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chargingStationId: stationId,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setSuccessMessage('Review submitted successfully');
      setActiveReviewId(null);
      setReviewComment('');
      setReviewRating(5);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
      setSuccessMessage(null);
    }
  };


  const getBookingStatus = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);

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
                        { booking.status === 'CHARGING'
                            ? 'View Charging'
                            : booking.status === 'COMPLETED'
                              ? 'Pay'
                              : booking.status === 'PAID'
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

                    {booking.status === 'PAID' && (
                      <>
                        <button
                          onClick={() =>
                            setActiveReviewId(activeReviewId === booking.id ? null : booking.id)
                          }
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline"
                        >
                          {activeReviewId === booking.id ? 'Cancel Review' : 'Add Review'}
                        </button>

                        {activeReviewId === booking.id && (
                          <div className="mt-3 p-4 rounded-lg bg-gray-50 w-full space-y-3 border border-gray-200 shadow-sm">
                            <textarea
                              placeholder="Write your comment..."
                              className="w-full border border-gray-300 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              rows={3}
                            />

                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center space-x-2">
                                <label htmlFor="rating" className="text-sm font-medium text-gray-600">
                                  Rating:
                                </label>
                                <select
                                  id="rating"
                                  value={reviewRating}
                                  onChange={(e) => setReviewRating(parseInt(e.target.value))}
                                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                >
                                  {[1, 2, 3, 4, 5].map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              </div>

                              <button
                                onClick={() => submitReview(booking.chargingStationId)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
                              >
                                Submit Review
                              </button>
                            </div>
                          </div>
                        )}

                      </>

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
