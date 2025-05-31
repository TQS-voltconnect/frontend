import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CalendarIcon, ClockIcon, CheckIcon, XIcon } from '@heroicons/react/outline';

const BookingPage = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const baseurl = import.meta.env.VITE_API_URL_LOCAL;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 9;
  const [bookingDetails, setBookingDetails] = useState(null);

  const filteredVehicles = vehicles.filter((vehicle) =>
    `${vehicle.brand} ${vehicle.model}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(
    indexOfFirstVehicle,
    indexOfLastVehicle
  );
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const response = await fetch(`${baseurl}/stations/${stationId}`);
        if (!response.ok) throw new Error("Failed to fetch station details");
        const data = await response.json();
        const processedStation = {
          id: data.id,
          name: `${data.city} Charging Station`,
          address: `Coordinates: ${data.location[0].toFixed(
            4
          )}, ${data.location[1].toFixed(4)}`,
          power: `${Math.max(...data.chargers.map((c) => c.chargingSpeed))} kW`,
          connectors: [...new Set(data.chargers.map((c) => c.chargerType))],
          chargers: data.chargers,
          availableSlots: generateAvailableSlots(),
        };
        setStation(processedStation);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${baseurl}/vehicles`);
        if (!response.ok) throw new Error("Failed to fetch vehicles");
        const data = await response.json();
        setVehicles(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchStation();
    fetchVehicles();
  }, [stationId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // ...existing code...
  function generateAvailableSlots() {
    const slots = [];
    const startHour = 10;
    const endHour = 19;
    const today = new Date();
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      const dateSlots = [];
      for (let hour = startHour; hour < endHour; hour++) {
        dateSlots.push({
          time: `${hour}:00 - ${hour + 1}:00`,
          isAvailable: true,
          isBooked: false,
        });
      }
      slots.push({ date, slots: dateSlots });
    }
    return slots;
  }
  // ...existing code...

  const availableDates = station?.availableSlots || [];
  const selectedDaySlots =
    availableDates.find(
      (day) => day.date.toDateString() === selectedDate.toDateString()
    )?.slots || [];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    if (!slot.isAvailable) {
      setError("This slot is already booked. Please choose another time.");
      return;
    }
    setSelectedSlot(slot);
    setError(null);
  };

  const handleConfirmBooking = async () => {
    if (
      !selectedSlot ||
      !selectedCharger ||
      !selectedVehicle ||
      !selectedDate
    ) {
      setError("Please select a vehicle, time slot, charger, and date.");
      return;
    }
    const startHour = parseInt(selectedSlot.time.split(":")[0], 10);
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHour, 0, 0, 0);

    const newBooking = {
      chargingStationId: station.id,
      chargerId: selectedCharger.id,
      vehicleId: selectedVehicle.id,
      startTime: startDateTime.toISOString(),
    };

    try {
      const response = await fetch(`${baseurl}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooking),
      });

      if (!response.ok) throw new Error("Failed to confirm booking.");
      const createdReservation = await response.json();

      setBookingDetails({
        stationName: station.name,
        vehicle: selectedVehicle,
        charger: selectedCharger,
        startTime: startDateTime,
        chargingTime: createdReservation.chargingTime,
        price: createdReservation.price,
      });

      setBookingConfirmed(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading)
    return <div className="text-center py-8">Loading station details...</div>;
  if (!station)
    return (
      <div className="text-center py-8 text-red-600">
        {error || "Station not found"}
      </div>
    );

  if (bookingConfirmed && bookingDetails) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckIcon className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="mt-3 text-lg font-medium text-gray-900">
          Booking Confirmed!
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Your reservation at <strong>{bookingDetails.stationName}</strong> is
          confirmed.
        </p>
        <div className="mt-4 text-sm text-left text-gray-700">
          <p>
            <strong>Vehicle:</strong> {bookingDetails.vehicle.brand}{" "}
            {bookingDetails.vehicle.model}
          </p>
          <p>
            <strong>Charger:</strong> {bookingDetails.charger.chargerType} (
            {bookingDetails.charger.chargingSpeed} kW)
          </p>
          <p>
            <strong>Start:</strong>{" "}
            {new Date(bookingDetails.startTime).toLocaleString()}
          </p>
          <p>
            <strong>Duration:</strong> {bookingDetails.chargingTime} minutes
          </p>
          <p>
            <strong>Estimated Price:</strong> €{bookingDetails.price.toFixed(2)}
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={() => navigate("/my-bookings")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Book Charging Slot - {station.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {station.address} • {station.power} •{" "}
                {station.connectors.join(", ")}
              </p>
            </div>

            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Select Vehicle
                </h4>
                <input
                  type="text"
                  placeholder="Search vehicle by brand or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
                />
                {searchTerm && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {currentVehicles.map((vehicle) => (
                        <button
                          key={vehicle.id}
                          onClick={() => setSelectedVehicle(vehicle)}
                          className={`p-3 rounded-md border text-left ${
                            selectedVehicle?.id === vehicle.id
                              ? "border-emerald-600 bg-emerald-50"
                              : "border-gray-300"
                          }`}
                        >
                          <div className="font-semibold">
                            {vehicle.brand} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.release_year}
                          </div>
                          <div className="mt-2">
                            <img
                              src={vehicle.image_url}
                              alt={vehicle.model}
                              className="w-full h-24 object-contain"
                            />
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-center items-center gap-4 mt-4">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Select Charger */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Select Charger
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {station.chargers.map((charger) => {
                    const isSelected = selectedCharger?.id === charger.id;
                    const isOccupied = charger.chargerStatus === "OCCUPIED";

                    const buttonClass = `py-2 px-4 rounded-md text-sm flex flex-col items-start transition ${
                      isOccupied
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`;

                    return (
                      <button
                        key={charger.id}
                        onClick={() => setSelectedCharger(charger)}
                        disabled={isOccupied}
                        className={buttonClass}
                      >
                        <span className="font-medium">{charger.chargerType}</span>
                        <span className="text-xs">
                          {charger.chargingSpeed} kW – {charger.chargerStatus}
                        </span>
                        <span className="text-xs">
                          €{charger.pricePerKWh.toFixed(2)} / kWh
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Date */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Select Date
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                  {selectedDaySlots.map((slot, index) => {
                    const isSelected = selectedSlot?.time === slot.time;
                    const isAvailable = slot.isAvailable;

                    const buttonClass = `py-2 px-4 rounded-md text-sm flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : isAvailable
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`;

                    return (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!isAvailable}
                        className={buttonClass}
                      >
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {slot.time.split('-')[0].trim()}
                        {!isAvailable && <XIcon className="h-4 w-4 ml-2 text-red-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Slot */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Available Time Slots
                </h4>
                {selectedDaySlots.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No available slots for this day
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedDaySlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        disabled={!slot.isAvailable}
                        className={`py-2 px-4 rounded-md text-sm flex items-center justify-center ${
                          selectedSlot?.time === slot.time
                            ? "bg-emerald-600 text-white"
                            : slot.isAvailable
                            ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {slot.time.split("-")[0].trim()}
                        {!slot.isAvailable && (
                          <XIcon className="h-4 w-4 ml-2 text-red-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Confirm Button */}
              <div className="mt-8">
                <button
                  onClick={handleConfirmBooking}
                  disabled={!selectedSlot || !selectedCharger}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    selectedSlot && selectedCharger
                      ? "bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      : "bg-gray-400 cursor-not-allowed"
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
  }
};

export default BookingPage;
