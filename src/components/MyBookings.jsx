import React from 'react';

const staticBookings = [
  {
    id: 1,
    stationId: '1',
    stationName: 'Central Lisbon Charging Hub',
    stationAddress: 'Rua do Comércio 123, Lisboa',
    date: '2025-05-20',
    time: '10:00 - 11:00',
    status: 'confirmed'
  },
  {
    id: 2,
    stationId: '2',
    stationName: 'Porto EV Station',
    stationAddress: 'Avenida dos Aliados 50, Porto',
    date: '2025-05-22',
    time: '14:00 - 15:00',
    status: 'confirmed'
  },
  {
    id: 3,
    stationId: '3',
    stationName: 'Coimbra Fast Charge',
    stationAddress: 'Praça da República 7, Coimbra',
    date: '2025-05-25',
    time: '09:00 - 10:00',
    status: 'pending'
  }
];

const MyBookings = () => {
  const bookings = staticBookings;

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
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="border border-gray-200 rounded-lg shadow-sm p-6 bg-white hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {booking.stationName}
            </h3>
            <p className="text-gray-600 mb-2">{booking.stationAddress}</p>

            <div className="flex flex-wrap gap-6 text-gray-700 text-sm font-medium">
              <div className="flex items-center space-x-1">
                <span className="font-semibold">Date:</span>
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">Time:</span>
                <span>{booking.time}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold">Status:</span>
                <span
                  className={`capitalize font-semibold ${
                    booking.status === 'confirmed'
                      ? 'text-green-600'
                      : booking.status === 'pending'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyBookings;
