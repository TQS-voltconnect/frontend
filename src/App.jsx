import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import StationSearch from './components/StationSearch';
import BookingPage from './components/BookingPage';
import MyBookings from './components/MyBookings';
import Navbar from './components/Navbar';
import Login from './components/Login';
import RoutePlanner from './components/RoutePlanner';
import Dashboard from './components/Dashboard';
import ChargingSession from './components/ChargingSession';
import SessionPayment from './components/SessionPayment';
import { useState, useEffect } from 'react';
import { baseUrl } from "./consts";

function App() {
  const [bookings, setBookings] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${baseUrl}/vehicles`);
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        const data = await response.json();
        setVehicles(data);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<StationSearch />} />
        <Route path="/stations/:stationId" element={<BookingPage />} />
        <Route
          path="/booking/:stationId"
          element={<BookingPage bookings={bookings} setBookings={setBookings} />}
        />
        <Route path="/my-bookings" element={<MyBookings bookings={bookings} />} />
        <Route path="/charging-session/:reservationId" element={<ChargingSession />} />
        <Route path="/payment/:sessionId" element={<SessionPayment />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/route-planner"
          element={
            <RoutePlanner
              vehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
              vehicles={vehicles}
            />
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;