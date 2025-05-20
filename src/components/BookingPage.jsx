import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CalendarIcon, ClockIcon, CheckIcon, XIcon, PencilIcon } from '@heroicons/react/outline';

const BookingPage = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockStation = {
      id: stationId,
      name: 'Central Lisbon Charging Hub',
      address: 'Rua do Comércio 123, Lisboa',
      power: '150 kW',
      connectors: ['CCS', 'Type 2'],
      availableSlots: generateAvailableSlots()
    };
    setStation(mockStation);
    setLoading(false);
  }, [stationId]);

  function generateAvailableSlots() {
    const slots = [];
    const startHour = 8;
    const endHour = 22;
    const today = new Date();
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      
      const dateSlots = [];
      for (let hour = startHour; hour < endHour; hour++) {
        // Randomly make some slots unavailable
        const isAvailable = Math.random() > 0.3;
        dateSlots.push({
          time: `${hour}:00 - ${hour + 1}:00`,
          isAvailable,
          isBooked: !isAvailable
        });
      }
      
      slots.push({
        date: date,
        slots: dateSlots
      });
    }
    
    return slots;
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    if (!slot.isAvailable) {
      setError('This slot is already booked. Please choose another time.');
      return;
    }
    setSelectedSlot(slot);
    setError(null);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      setError('Please select a time slot first.');
      return;
    }
    
    // In a real app, you would call an API here
    setBookingConfirmed(true);
    
    // Save to local storage for demo purposes
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const newBooking = {
      id: Date.now(),
      stationId: station.id,
      stationName: station.name,
      stationAddress: station.address,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedSlot.time,
      status: 'confirmed'
    };
    localStorage.setItem('bookings', JSON.stringify([...bookings, newBooking]));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) return <div className="text-center py-8">Loading station details...</div>;
  if (!station) return <div className="text-center py-8">Station not found</div>;

  if (bookingConfirmed) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckIcon className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="mt-3 text-lg font-medium text-gray-900">Booking Confirmed!</h2>
        <p className="mt-2 text-sm text-gray-500">
          Your slot at {station.name} on {formatDate(selectedDate)} at {selectedSlot.time} is confirmed.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/my-bookings')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  const availableDates = station.availableSlots;
  const selectedDaySlots = availableDates.find(day => 
    day.date.toDateString() === selectedDate.toDateString()
  )?.slots || [];

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Book Charging Slot - {station.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {station.address} • {station.power} • {station.connectors.join(', ')}
            </p>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Select Date</h4>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {availableDates.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day.date)}
                    className={`py-2 px-1 text-sm rounded-md flex flex-col items-center ${
                      day.date.toDateString() === selectedDate.toDateString()
                        ? 'bg-emerald-100 text-emerald-800 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-lg font-medium">{day.date.getDate()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Available Time Slots</h4>
              {selectedDaySlots.length === 0 ? (
                <p className="text-sm text-gray-500">No available slots for this day</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedDaySlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={!slot.isAvailable}
                      className={`py-2 px-4 rounded-md text-sm flex items-center justify-center ${
                        selectedSlot?.time === slot.time
                          ? 'bg-emerald-600 text-white'
                          : slot.isAvailable
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {slot.time}
                      {!slot.isAvailable && <XIcon className="h-4 w-4 ml-2 text-red-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={handleConfirmBooking}
                disabled={!selectedSlot}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  selectedSlot
                    ? 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;