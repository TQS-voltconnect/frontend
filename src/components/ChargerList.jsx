import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l2.121-2.121a2.828 2.828 0 114 4l-2.121 2.121m-4.242-4.242L5 15v4h4l7.621-7.621a2.828 2.828 0 00-4-4z" />
  </svg>
);

const ChargerList = ({ chargers, stationId, onEdit, onDelete, onAdd }) => {
  const [confirmDelete, setConfirmDelete] = useState({ open: false, chargerId: null });

  const handleConfirmDelete = (chargerId) => {
    setConfirmDelete({ open: true, chargerId });
  };

  const confirmAndDelete = () => {
    onDelete(confirmDelete.chargerId);
    setConfirmDelete({ open: false, chargerId: null });
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold text-emerald-700 text-base mb-2">Chargers</h4>
      <div className="space-y-2">
        {chargers && chargers.length > 0 ? (
          chargers.map((charger) => (
            <div
              key={charger.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
            >
              <div className="text-sm text-gray-700">
                <p className="font-medium">{charger.chargerType}</p>
                <p className="text-xs text-gray-500">
                  Status: {charger.chargerStatus} | {charger.chargingSpeed}kW | €{charger.pricePerKWh}/kWh
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(stationId, charger)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors duration-150"
                  aria-label="Edit charger"
                >
                  <PencilIcon className="h-4 w-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleConfirmDelete(charger.id)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-red-100 transition-colors duration-150"
                  aria-label="Delete charger"
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">No chargers available.</p>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={() => onAdd(stationId)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors duration-150"
        >
          + Add Charger
        </button>
      </div>

      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
            <div className="flex flex-col items-center mb-4">
              <TrashIcon className="h-10 w-10 text-red-500 mb-2" />
              <h2 className="text-xl font-bold mb-2">Delete Charger</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this charger? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDelete({ open: false, chargerId: null })}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAndDelete}
                className="px-4 py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <TrashIcon className="h-5 w-5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ChargerList.propTypes = {
  chargers: PropTypes.array.isRequired,
  stationId: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default ChargerList;
