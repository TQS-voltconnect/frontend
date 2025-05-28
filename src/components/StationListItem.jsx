import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const StationListItem = ({ station, isSelected, onSelect }) => {
  return (
    <li
      className={`p-6 transition-colors cursor-pointer ${
        isSelected
          ? "bg-emerald-50 border-l-4 border-emerald-500"
          : "hover:bg-gray-50"
      }`}
      onClick={() => {
        onSelect(station.id);
        document.querySelector(".map-container")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-emerald-600">{station.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{station.address}</p>
          <p className="text-sm text-gray-500 mt-1">{station.city}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${
            station.available > 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {station.available}/{station.total} available
        </span>
      </div>

      <div className="flex items-center mt-3 text-sm text-gray-500 space-x-3">
        <span>{station.power}</span>
        <div className="flex items-center">
          <svg
            className="h-4 w-4 text-yellow-400 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{station.rating}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {station.connectors.map((connector, idx) => (
          <span
            key={idx}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium"
          >
            {connector}
          </span>
        ))}
      </div>

      <div className="mt-4">
        <Link
          to={`/stations/${station.id}`}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded shadow-sm text-white bg-emerald-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          View Details
        </Link>
      </div>
    </li>
  );
};

export default StationListItem;
StationListItem.propTypes = {
  station: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    available: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    power: PropTypes.string.isRequired,
    rating: PropTypes.string.isRequired,
    connectors: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};