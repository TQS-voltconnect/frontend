import React, { useEffect, useState } from 'react';
import { baseUrl } from '../consts';
import PropTypes from 'prop-types';
import ChargerList from '../components/ChargerList';
import ReviewList from '../components/ReviewList';
import ChargerModal from '../components/ChargerModal';



const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
        </svg>
      ))}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
};

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
  </svg>
);

TrashIcon.propTypes = {
  className: PropTypes.string,
};

const Dashboard = () => {
  const [reviews, setReviews] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [modal, setModal] = useState({ open: false, reviewId: null });
  const [stationModal, setStationModal] = useState({ open: false, stationId: null });
  const [creating, setCreating] = useState(false);
  const [newStation, setNewStation] = useState({ city: '', location: ['', ''], operatorId: '' });
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [chargerModal, setChargerModal] = useState({ open: false, mode: 'create', stationId: null, charger: null });
  const [searchQuery, setSearchQuery] = useState('');




  useEffect(() => {
    fetchReviews();
    fetchStations();
  }, [baseUrl]);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/stations`);
      if (!response.ok) throw new Error('Failed to fetch stations');
      const data = await response.json();
      setStations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    setDeletingId(id);
    try {
      const response = await fetch(`${baseUrl}/reviews/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete review');
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setModal({ open: false, reviewId: null });
    } catch (err) {
      setError('Error deleting review: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteStation = async (id) => {
    setDeletingId(id);
    try {
      const response = await fetch(`${baseUrl}/stations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete station');
      setStations((prev) => prev.filter((s) => s.id !== id));
      setStationModal({ open: false, stationId: null });
    } catch (err) {
      setError('Error deleting station: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const payload = {
        city: newStation.city,
        location: [parseFloat(newStation.location[0]), parseFloat(newStation.location[1])],
        operatorId: parseInt(newStation.operatorId),
        chargers: [],
      };
      const response = await fetch(`${baseUrl}/stations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create station');
      const created = await response.json();
      setStations((prev) => [...prev, created]);
      setNewStation({ city: '', location: ['', ''], operatorId: '' });
    } catch (err) {
      setError('Error creating station: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleSaveCharger = async (chargerData) => {
    setError(null);
    setDeletingId(chargerData.charger?.id || null);

    try {
      const isEdit = chargerModal.mode === 'edit';
      const endpoint = isEdit
        ? `${baseUrl}/chargers/${chargerModal.charger.id}`
        : `${baseUrl}/chargers`;

      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        chargerType: chargerData.chargerType,
        chargerStatus: chargerData.chargerStatus,
        pricePerKWh: parseFloat(chargerData.pricePerKWh),
        chargingSpeed: parseFloat(chargerData.chargingSpeed),
        chargingStation: {
          id: chargerModal.stationId
        }
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save charger');

      await fetchStations();
      setChargerModal({ open: false, mode: 'create', stationId: null, charger: null });
    } catch (err) {
      setError('Error saving charger: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };


const handleDeleteCharger = async (chargerId, stationId) => {
  try {
    const response = await fetch(`${baseUrl}/chargers/${chargerId}`, {
      method: 'DELETE',
    });
    await fetchStations(); // Atualiza a UI
  } catch (err) {
    setError('Error deleting charger: ' + err.message);
  }
};



  const getReviewsByStation = (stationId) => {
    return reviews.filter((r) => r.chargingStationId === stationId);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-emerald-700 flex items-center gap-2">
        Admin Dashboard
      </h1>
      {/* Stations Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-600">Charging Stations</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by city or station ID..."
            className="w-full md:w-1/2 px-4 py-2 border border-emerald-200 rounded-xl shadow-sm focus:ring-emerald-500 focus:border-emerald-500 transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <form
          onSubmit={handleCreateStation}
          className="mb-6 flex flex-col md:flex-row gap-4 items-end bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow duration-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            {/* City Input */}
            <div className="relative">
              <label htmlFor="city" className="block text-sm font-medium text-emerald-700 mb-1 ml-1">
                City
              </label>
              <input
                id="city"
                type="text"
                required
                placeholder="e.g. Lisbon"
                className="w-full px-4 py-2 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 shadow-sm"
                value={newStation.city}
                onChange={e => setNewStation(s => ({ ...s, city: e.target.value }))}
              />
            </div>

            {/* Latitude Input */}
            <div className="relative">
              <label htmlFor="latitude" className="block text-sm font-medium text-emerald-700 mb-1 ml-1">
                Latitude
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                required
                placeholder="e.g. 38.7223"
                className="w-full px-4 py-2 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 shadow-sm"
                value={newStation.location[0]}
                onChange={e => setNewStation(s => ({ ...s, location: [e.target.value, s.location[1]] }))}
              />
            </div>

            {/* Longitude Input */}
            <div className="relative">
              <label htmlFor="longitude" className="block text-sm font-medium text-emerald-700 mb-1 ml-1">
                Longitude
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                required
                placeholder="e.g. -9.1393"
                className="w-full px-4 py-2 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 shadow-sm"
                value={newStation.location[1]}
                onChange={e => setNewStation(s => ({ ...s, location: [s.location[0], e.target.value] }))}
              />
            </div>

            {/* Operator ID Input */}
            <div className="relative">
              <label htmlFor="operatorId" className="block text-sm font-medium text-emerald-700 mb-1 ml-1">
                Operator ID
              </label>
              <input
                id="operatorId"
                type="number"
                required
                placeholder="Operator number"
                className="w-full px-4 py-2 border-2 border-emerald-100 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 shadow-sm"
                value={newStation.operatorId}
                onChange={e => setNewStation(s => ({ ...s, operatorId: e.target.value }))}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className={`px-6 py-2 rounded-xl font-semibold shadow-sm border-2 transition-all duration-200 ${creating
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:shadow-md'
              }`}
          >
            {creating ? 'Creating...' : 'Create Station'}
          </button>

        </form>
        {stations.length === 0 ? (
          <div className="text-gray-500 text-center">No stations found.</div>
        ) : (
          <ul className="space-y-6">
            {stations
              .filter((station) =>
                station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                station.id.toString().includes(searchQuery)
              )
              .map((station) => (
                <li
                  key={station.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-4"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-emerald-700">Station #{station.id}</h3>
                      <p className="text-gray-600">City: {station.city}</p>
                      <p className="text-gray-600">
                        Location: [{station.location?.[0]}, {station.location?.[1]}]
                      </p>
                      <p className="text-gray-600">Operator ID: {station.operatorId}</p>
                    </div>
                    <button
                      onClick={() => setStationModal({ open: true, stationId: station.id })}
                      disabled={deletingId === station.id}
                      className="p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50"
                      aria-label="Delete station"
                    >
                      <TrashIcon className="h-5 w-5 text-red-500" />
                    </button>
                  </div>

                  {/* Chargers */}
                  <div className="bg-gray-50 p-4 rounded-xl">
<ChargerList
  chargers={station.chargers}
  stationId={station.id}
  onEdit={(stationId, charger) => setChargerModal({ open: true, mode: 'edit', stationId, charger })}
  onDelete={(chargerId) => handleDeleteCharger(chargerId, station.id)}
  onAdd={(stationId) => setChargerModal({ open: true, mode: 'create', stationId, charger: null })}
/>


                    <ChargerModal
                      isOpen={chargerModal.open}
                      mode={chargerModal.mode}
                      stationId={chargerModal.stationId}
                      charger={chargerModal.charger}
                      onClose={() => setChargerModal({ open: false, mode: 'create', stationId: null, charger: null })}
                      onSave={handleSaveCharger}
                    />

                  </div>

                  {/* Reviews */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-medium text-sm text-emerald-600 mb-2">Reviews:</h4>
                    <ul className="space-y-3">
                      {getReviewsByStation(station.id).length > 0 ? (
                        getReviewsByStation(station.id).map((review) => (
                          <li
                            key={review.id}
                            className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between items-start shadow-sm"
                          >
                            <div>
                              <StarRating rating={review.rating} />
                              <p className="text-sm italic text-gray-700 mt-1">"{review.comment}"</p>
                            </div>
                            <button
                              onClick={() => setModal({ open: true, reviewId: review.id })}
                              disabled={deletingId === review.id}
                              className="p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50"
                              aria-label="Delete review"
                            >
                              <TrashIcon className="h-4 w-4 text-red-500" />
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500">No reviews.</li>
                      )}
                    </ul>
                    {modal.open && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
                          <div className="flex flex-col items-center mb-4">
                            <TrashIcon className="h-10 w-10 text-red-500 mb-2" />
                            <h2 className="text-xl font-bold mb-2">Delete Review</h2>
                            <p className="text-gray-600 mb-4">
                              Are you sure you want to delete this review? This action cannot be undone.
                            </p>
                          </div>
                          <div className="flex justify-center gap-4">
                            <button
                              onClick={() => setModal({ open: false, reviewId: null })}
                              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                              disabled={deletingId !== null}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteReview(modal.reviewId)}
                              className="px-4 py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                              disabled={deletingId !== null}
                            >
                              {deletingId !== null ? (
                                <svg
                                  className="animate-spin h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                  ></path>
                                </svg>
                              ) : (
                                <TrashIcon className="h-5 w-5" />
                              )}
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}



                  </div>
                </li>
              ))}
          </ul>

        )}
        {/* Modal de confirmação de remoção de station */}
        {stationModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
              <div className="flex flex-col items-center mb-4">
                <TrashIcon className="h-10 w-10 text-red-500 mb-2" />
                <h2 className="text-xl font-bold mb-2">Delete Station</h2>
                <p className="text-gray-600 mb-4">Are you sure you want to delete this station? This action cannot be undone.</p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setStationModal({ open: false, stationId: null })}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                  disabled={deletingId !== null}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteStation(stationModal.stationId)}
                  className="px-4 py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  disabled={deletingId !== null}
                >
                  {deletingId !== null ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  ) : (
                    <TrashIcon className="h-5 w-5" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </section>

    </div >
  );
};
export default Dashboard;