import React, { useEffect, useState } from 'react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseurl = import.meta.env.VITE_API_URL_LOCAL;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${baseurl}/reservations`);
        const reservations = await res.json();

        const detailedBookings = await Promise.all(
          reservations.map(async (reservation) => {
            const [stationRes, chargerRes, vehicleRes] = await Promise.all([
              fetch(`${baseurl}/stations/${reservation.chargingStationId}`),
              fetch(`${baseurl}/chargers/${reservation.chargerId}`),
              fetch(`${baseurl}/vehicles/${reservation.vehicleId}`)
            ]);

            const [station, charger, vehicle] = await Promise.all([
              stationRes.json(),
              chargerRes.json(),
              vehicleRes.json()
            ]);

            return {
              id: reservation.id,
              date: new Date(reservation.startTime).toLocaleDateString(),
              time: new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              duration: reservation.chargingTime,
              price: reservation.price,
              stationCity: station.city,
              chargerType: charger.chargerType,
              chargerSpeed: charger.chargingSpeed,
              vehicleBrand: vehicle.brand,
              vehicleModel: vehicle.model,
              vehicleYear: vehicle.release_year,
              vehicleImage: vehicle.image_url
            };
          })
        );

        setBookings(detailedBookings);
        setLoading(false);
      } catch (err) {
        setError('Failed to load bookings');
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading bookings...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (bookings.length === 0) return <div className="text-center py-8 text-gray-500 text-lg">No bookings found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold mb-8 text-emerald-700">My Charging Bookings</h2>
      <ul className="space-y-6">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="border border-gray-200 rounded-lg shadow-sm p-6 bg-white hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {booking.stationCity} Charging Station
            </h3>
            <p className="text-gray-600 mb-2">Charging Time: {booking.duration} min • Price: €{booking.price.toFixed(2)}</p>

            <div className="flex flex-wrap gap-6 text-gray-700 text-sm font-medium mb-4">
              <div className="flex items-center space-x-1">
                <span className="font-semibold">Date:</span>
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">Time:</span>
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">Charger:</span>
                <span>{booking.chargerType} • {booking.chargerSpeed} kW</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <img src={booking.vehicleImage} alt={booking.vehicleModel} className="w-24 h-16 object-contain rounded" />
              <div>
                <p className="text-gray-800 font-medium">{booking.vehicleBrand} {booking.vehicleModel}</p>
                <p className="text-gray-500 text-sm">{booking.vehicleYear}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyBookings;
