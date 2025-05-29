import React, { useEffect, useState } from 'react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stations, setStations] = useState({});
  const [chargers, setChargers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseurl = import.meta.env.VITE_API_URL_LOCAL;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${baseurl}/reservations`);
        if (!response.ok) throw new Error('Failed to fetch reservations');
        const data = await response.json();

        const stationPromises = data.map((res) =>
          fetch(`${baseurl}/stations/${res.chargingStationId}`).then((r) => r.json())
        );

        const chargerPromises = data.map((res) =>
          fetch(`${baseurl}/chargers/${res.chargerId}`).then((r) => r.json())
        );

        const stationResults = await Promise.all(stationPromises);
        const chargerResults = await Promise.all(chargerPromises);

        const stationMap = {};
        stationResults.forEach((s) => {
          stationMap[s.id] = s;
        });

        const chargerMap = {};
        chargerResults.forEach((c) => {
          chargerMap[c.id] = c;
        });

        setStations(stationMap);
        setChargers(chargerMap);
        setBookings(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [baseurl]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500 text-lg">Loading bookings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-lg">
        No bookings found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold mb-8 text-emerald-700">My Charging Bookings</h2>
      <ul className="space-y-6">
        {bookings.map((booking) => {
          const station = stations[booking.chargingStationId];
          const charger = chargers[booking.chargerId];

          return (
            <li
              key={booking.id}
              className="border border-gray-200 rounded-lg shadow-sm p-6 bg-white hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {station?.city || 'Unknown City'} Charging Station
              </h3>

              <div className="flex flex-wrap gap-6 text-gray-700 text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">Start Time:</span>
                  <span>{new Date(booking.startTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">Duration:</span>
                  <span>{booking.chargingTime} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">Price:</span>
                  <span>€{booking.price?.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-700">
                <p><strong>Charger Type:</strong> {charger?.chargerType}</p>
                <p><strong>Speed:</strong> {charger?.chargingSpeed} kW</p>
                <p><strong>Price per kWh:</strong> €{charger?.pricePerKWh?.toFixed(2)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MyBookings;
