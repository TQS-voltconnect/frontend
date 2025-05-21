import { Filter, ChevronDown, Zap, Plug } from 'lucide-react';

export default function ChargingFilters({ filters, onChange, showAdvanced, toggleAdvanced }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Only Toggle */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-full">
              <Plug className="h-5 w-5 text-green-600" />
            </div>
            <span className="ml-3 text-gray-700 select-none cursor-pointer">Available Only</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="availableOnly"
              checked={filters.availableOnly}
              onChange={onChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-green-300 peer-checked:bg-green-600 relative transition-colors">
              <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-5"></span>
            </div>
          </label>
        </div>

        {/* Connector Type Dropdown */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <Plug className="h-5 w-5 text-blue-600" />
            </div>
            <label htmlFor="connector-type" className="ml-3 text-gray-700 cursor-pointer">
              Connector Type
            </label>
          </div>
          <select
            id="connector-type"
            name="connectorType"
            value={filters.connectorType}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 text-base border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
          >
            <option value="all">All Types</option>
            <option value="Type 2">Type 2</option>
            <option value="CCS">CCS</option>
            <option value="CHAdeMO">CHAdeMO</option>
          </select>
        </div>

        {/* Power Level Dropdown */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center mb-2">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            <label htmlFor="power-level" className="ml-3 text-gray-700 cursor-pointer">
              Power Level
            </label>
          </div>
          <select
            id="power-level"
            name="powerLevel"
            value={filters.powerLevel}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 text-base border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white"
          >
            <option value="all">All Power Levels</option>
            <option value="low">Low (≤ 22 kW)</option>
            <option value="medium">Medium (23-50 kW)</option>
            <option value="high">High (&gt; 50 kW)</option>
          </select>
        </div>
      </div>

    </div>
  );
}
