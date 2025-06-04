import React, { useEffect, useState } from 'react';
import { baseUrl } from '../consts';
import PropTypes from 'prop-types';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [modal, setModal] = useState({ open: false, reviewId: null });

  useEffect(() => {
    fetchReviews();
  }, [baseurl]);

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

  const handleDelete = async (id) => {
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

  if (loading) return <div className="p-8">Loading reviews...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-emerald-700 flex items-center gap-2">
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
        Reviews Dashboard
      </h1>
      {reviews.length === 0 ? (
        <div className="text-gray-500 text-center">No reviews found.</div>
      ) : (
        <ul className="space-y-6">
          {reviews.map((review, idx) => (
            <li key={review.id || idx} className="bg-white border border-gray-200 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Station ID: <span className="font-semibold text-gray-700">{review.chargingStationId}</span></span>
                  <StarRating rating={review.rating} />
                </div>
                <div className="mt-2 text-gray-700 italic">"{review.comment}"</div>
              </div>
              <button
                onClick={() => setModal({ open: true, reviewId: review.id })}
                disabled={deletingId === review.id}
                className={`mt-2 md:mt-0 p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                aria-label="Delete review"
              >
                <TrashIcon className="h-5 w-5 text-red-500" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
            <div className="flex flex-col items-center mb-4">
              <TrashIcon className="h-10 w-10 text-red-500 mb-2" />
              <h2 className="text-xl font-bold mb-2">Delete Review</h2>
              <p className="text-gray-600 mb-4">Are you sure you want to delete this review? This action cannot be undone.</p>
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
                onClick={() => handleDelete(modal.reviewId)}
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
    </div>
  );
};
export default Dashboard;