import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import StationSearch from './components/StationSearch';
import BookingPage from './components/BookingPage';
import MyBookings from './components/MyBookings';
import Navbar from './components/Navbar';
import Login from './components/Login';
import RoutePlanner from './components/RoutePlanner';
import { useState, useEffect } from 'react';

function App() {
  const [bookings, setBookings] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const baseurl = import.meta.env.VITE_API_URL_LOCAL;

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${baseurl}/vehicles`);
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
      </Routes>
    </Router>
  );
}

export default App;