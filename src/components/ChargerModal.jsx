import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ChargerModal = ({ isOpen, mode, stationId, charger, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    chargerType: 'AC1',
    chargerStatus: 'AVAILABLE',
    pricePerKWh: '',
    chargingSpeed: '',
  });

  useEffect(() => {
    if (mode === 'edit' && charger) {
      setFormData({
        chargerType: charger.chargerType || 'AC1',
        chargerStatus: charger.chargerStatus || 'AVAILABLE',
        pricePerKWh: charger.pricePerKWh || '',
        chargingSpeed: charger.chargingSpeed || '',
      });
    } else {
      setFormData({
        chargerType: 'AC1',
        chargerStatus: 'AVAILABLE',
        pricePerKWh: '',
        chargingSpeed: '',
      });
    }
  }, [mode, charger]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, stationId });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {mode === 'edit' ? 'Edit Charger' : 'Add Charger'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Charger Type</label>
            <select
              name="chargerType"
              value={formData.chargerType}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="AC1">AC1</option>
              <option value="AC2">AC2</option>
              <option value="DC">DC</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="chargerStatus"
              value={formData.chargerStatus}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price per kWh (€)</label>
            <input
              type="number"
              step="0.01"
              name="pricePerKWh"
              value={formData.pricePerKWh}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* Speed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Charging Speed (kW)</label>
            <input
              type="number"
              step="0.1"
              name="chargingSpeed"
              value={formData.chargingSpeed}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ChargerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['edit', 'create']).isRequired,
  stationId: PropTypes.number.isRequired,
  charger: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default ChargerModal;
