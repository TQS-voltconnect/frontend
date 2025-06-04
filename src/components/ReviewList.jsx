import React from 'react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';

const ReviewList = ({ reviews }) => {
  return (
    <div className="mt-2">
      <h4 className="font-medium text-sm text-emerald-600">Reviews:</h4>
      <ul className="list-disc ml-5 text-gray-600 space-y-2">
        {reviews && reviews.length > 0 ? reviews.map((review) => (
          <li key={review.id}>
            <StarRating rating={review.rating} /> <span className="italic">"{review.comment}"</span>
          </li>
        )) : <li>No reviews.</li>}
      </ul>
    </div>
  );
};

ReviewList.propTypes = {
  reviews: PropTypes.array.isRequired,
};

export default ReviewList;
