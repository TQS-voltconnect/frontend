import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import StationSearch from './components/StationSearch';
import BookingPage from './components/BookingPage';
import MyBookings from './components/MyBookings';
import Navbar from './components/Navbar';
import Login from './components/Login';
import { useState } from 'react';

function App() {
  const [bookings, setBookings] = useState([]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<StationSearch />} />
        <Route path="/stations/:stationId/book" element={<BookingPage />} />
        <Route
          path="/booking/:stationId"
          element={<BookingPage bookings={bookings} setBookings={setBookings} />}
        />
        <Route path="/my-bookings" element={<MyBookings bookings={bookings} />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;