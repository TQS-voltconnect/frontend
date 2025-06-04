import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import StarRating from "./StarRating";

const StationListItem = ({ station, isSelected, onSelect, reviews, avgRating, reviewsLoading, showModal, setShowModal }) => {
  const reviewsCount = reviews ? reviews.length : 0;

  let availabilityClass;

  if (station.available > 0) {
    if (isSelected) {
      availabilityClass = "bg-emerald-600 text-white";
    } else {
      availabilityClass = "bg-green-100 text-green-800";
    }
  } else {
    availabilityClass = "bg-red-100 text-red-800";
  }

  return (
    <button
      type="button"
      className={`w-full transition-colors cursor-pointer text-left outline-none border-l-4 ${
        isSelected
          ? "bg-emerald-50 border-emerald-500 shadow-md"
          : "bg-white border-transparent hover:bg-gray-50"
      } rounded-none px-0 py-0`}
      onClick={() => {
        onSelect(station.id);
        document.querySelector(".map-container")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect(station.id);
          document.querySelector(".map-container")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }}
      style={{ width: '100%' }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-emerald-600">{station.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{station.address}</p>
            <p className="text-sm text-gray-500 mt-1">{station.city}</p>
          </div>
          <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${availabilityClass}`}
          >
            {station.available}/{station.total} available
          </span>
        </div>

        <div className="flex items-center mt-3 text-sm text-gray-500 space-x-3">
          <span>{station.power}</span>
          <div className="flex-1 flex items-center gap-2">
            {reviewsCount > 0 && avgRating !== null ? (
              <>
                <StarRating rating={avgRating} />
                <span className="ml-1">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({reviewsCount})</span>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">No reviews yet</span>
            )}
          </div>
          {reviewsCount > 0 && (
            <button
              type="button"
              className={`px-3 py-1 text-xs rounded font-semibold border transition-colors
                ${isSelected
                  ? 'bg-white text-emerald-700 border-emerald-500 hover:bg-emerald-600 hover:text-white'
                  : 'bg-gray-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}
              `}
              onClick={e => { e.stopPropagation(); onSelect(station.id); setShowModal(true); }}
              onKeyDown={e => { e.stopPropagation(); }}
            >
              See all reviews
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {station.connectors.map((connector) => (
            <span
              key={connector}
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
            Book
          </Link>
        </div>
      </div>

      {/* Modal for all reviews */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="relative bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-left max-h-[80vh] overflow-y-auto pointer-events-auto">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setShowModal(false)}
              aria-label="Close reviews modal"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              Reviews for {station.name}
              {reviewsLoading && <span className="text-xs text-gray-400">Loading...</span>}
            </h2>
            {reviews && reviews.length > 0 ? (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li key={review.id} className="bg-gray-50 rounded-lg p-3 border border-emerald-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-gray-500">{review.rating}/5</span>
                    </div>
                    <div className="text-sm text-gray-700 italic">"{review.comment}"</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-400 mb-2">No reviews for this station yet.</div>
            )}
          </div>
        </div>
      )}
    </button>
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
  reviews: PropTypes.array,
  avgRating: PropTypes.number,
  reviewsLoading: PropTypes.bool,
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired,
};