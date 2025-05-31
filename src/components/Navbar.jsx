import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-emerald-600">
                        <Zap className="w-5 h-5 fill-current text-emerald-600" />
                        <span>VoltConnect</span>
                    </Link>

                    {/* Toggle button for mobile */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-emerald-600 font-bold text-lg focus:outline-none"
                        >
                            {isOpen ? '×' : '☰'}
                        </button>
                    </div>

                    {/* Desktop links */}
                    <div className="hidden md:flex space-x-6">
                        <Link to="/search" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            Search Stations
                        </Link>
                        <Link to="/my-bookings" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            My Bookings
                        </Link>
                        <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            Dashboard
                        </Link>
                        <Link to="/profile" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                            Profile
                        </Link>
                        <Link to="/login" className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-800">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden px-4 pt-2 pb-4 space-y-2">
                    <Link to="/search" className="block text-gray-700 hover:text-gray-900">
                        Search Stations
                    </Link>
                    <Link to="/my-bookings" className="block text-gray-700 hover:text-gray-900">
                        My Bookings
                    </Link>
                    <Link to="/dashboard" className="block text-gray-700 hover:text-gray-900">
                        Dashboard
                    </Link>
                    <Link to="/profile" className="block text-gray-700 hover:text-gray-900">
                        Profile
                    </Link>
                    <Link to="/login" className="block bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-800 w-fit">
                        Sign In
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
