import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import StationSearch from './components/StationSearch';
import BookingPage from './components/BookingPage';
import MyBookings from './components/MyBookings';
import Navbar from './components/Navbar';
import Login from './components/Login';
import SearchStations from './components/StationSearch';
import ChargingSession from './components/ChargingSession';
import SessionPayment from './components/SessionPayment';
import { useState } from 'react';


function App() {
  const [bookings, setBookings] = useState([]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchStations />} />
          <Route path="/stations/:stationId" element={<BookingPage />} />
          <Route
            path="/booking/:stationId"
            element={<BookingPage bookings={bookings} setBookings={setBookings} />}
          />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/charging-session/:reservationId" element={<ChargingSession />} />
          <Route path="/payment/:sessionId" element={<SessionPayment />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;