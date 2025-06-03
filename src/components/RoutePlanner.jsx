import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { calculateRoute } from "../utils/routeCalculator";
import axios from "axios";
import {
  MapIcon,
  TruckIcon,
  ClockIcon,
  CurrencyEuroIcon,
  LightningBoltIcon,
} from "@heroicons/react/outline";
import PropTypes from 'prop-types';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const RoutePlanner = ({ vehicle, setSelectedVehicle, vehicles }) => {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [route, setRoute] = useState(null);
  const [chargingStops, setChargingStops] = useState([]);
  const [error, setError] = useState("");
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 9;
  const baseurl = import.meta.env.VITE_API_URL_LOCAL;

  const cityCoordinates = {
    Lisboa: [38.7169, -9.1399],
    Porto: [41.1496, -8.6109],
    Coimbra: [40.2056, -8.4196],
    Viseu: [40.661, -7.9097],
    Braga: [41.5454, -8.4265],
    Aveiro: [40.6405, -8.6538],
    Leiria: [39.7495, -8.8077],
    Faro: [37.0194, -7.9304],
    Évora: [38.5713, -7.9136],
    Beja: [38.0141, -7.8632],
    "Castelo Branco": [39.8222, -7.4918],
    "Vila Real": [41.3006, -7.7441],
    Bragança: [41.8062, -6.7567],
    Guarda: [40.5373, -7.2677],
    Portalegre: [39.2967, -7.4286],
    Santarém: [39.2362, -8.6855],
    Setúbal: [38.5244, -8.8882],
    "Viana do Castelo": [41.6932, -8.8329],
  };

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${baseurl}/stations`);
        setStations(response.data);
      } catch (err) {
        console.error("Error loading stations:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load stations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredVehicles = vehicles.filter((vehicleItem) =>
    `${vehicleItem.brand} ${vehicleItem.model}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(
    indexOfFirstVehicle,
    indexOfLastVehicle
  );
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);

  const calculateRouteHandler = async () => {
    try {
      setError("");

      if (!vehicle) {
        throw new Error("Please select a vehicle first");
      }

      const startCoords = cityCoordinates[startLocation];
      const endCoords = cityCoordinates[endLocation];

      if (!startCoords || !endCoords) {
        throw new Error("Please enter valid city names");
      }

      const calculatedRoute = calculateRoute(
        startCoords,
        endCoords,
        vehicle,
        stations
      );
      setRoute(calculatedRoute);
      setChargingStops(calculatedRoute.stops);
    } catch (err) {
      setError(err.message || "Error calculating route. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <MapIcon className="h-8 w-8 text-emerald-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Route Planner</h1>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Select Vehicle
            </h4>
            <div className="mb-4 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                placeholder="Search vehicle by brand or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search vehicles"
              />
            </div>
            {searchTerm && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {currentVehicles.map((vehicleItem) => (
                    <button
                      key={vehicleItem.id}
                      onClick={() => {
                        setSelectedVehicle(vehicleItem);
                        setSearchTerm("");
                      }}
                      className={`p-3 rounded-md border text-left ${vehicle?.id === vehicleItem.id
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-gray-300"
                        }`}
                    >
                      <div className="font-semibold">
                        {vehicleItem.brand} {vehicleItem.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vehicleItem.release_year}
                      </div>
                      <div className="mt-2">
                        <img
                          src={vehicleItem.image_url}
                          alt={vehicleItem.model}
                          className="w-full h-24 object-contain"
                        />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <div className="space-y-4 h-full flex flex-col">
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex-1 flex flex-col">
      <div className="flex items-start mb-3">
        <div className="bg-emerald-100 p-2 rounded-full mr-3">
          <MapIcon className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Start Location
          </h3>
        </div>
      </div>
      <div className="relative">
        <select
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          className="appearance-none block w-full px-4 py-3 pr-10 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 cursor-pointer"
        >
          <option value="">Select a city</option>
          {Object.keys(cityCoordinates)
            .sort((a, b) => a.localeCompare(b, 'pt'))
            .map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
    
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex-1 flex flex-col">
      <div className="flex items-start mb-3">
        <div className="bg-emerald-100 p-2 rounded-full mr-3">
          <MapIcon className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            End Location
          </h3>
        </div>
      </div>
      <div className="relative">
        <select
          value={endLocation}
          onChange={(e) => setEndLocation(e.target.value)}
          className="appearance-none block w-full px-4 py-3 pr-10 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 cursor-pointer"
        >
          <option value="">Select a city</option>
          {Object.keys(cityCoordinates)
            .sort((a, b) => a.localeCompare(b, 'pt'))
            .map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>

            {vehicle && (
              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 h-full flex flex-col justify-between">
                <div className="flex items-start mb-3">
                  <div className="bg-emerald-100 p-2 rounded-full mr-3">
                    <TruckIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Selected Vehicle
                    </h3>
                    <p className="text-sm text-emerald-600 font-medium">
                      {vehicle.brand} {vehicle.model}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center mb-3">
                  <img
                    src={vehicle.image_url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-32 object-contain rounded-lg bg-gray-50 p-2 border border-gray-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <p className="text-gray-500">Year</p>
                    <p className="font-medium">{vehicle.release_year}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <p className="text-gray-500">Battery</p>
                    <p className="font-medium">
                      {vehicle.usable_battery_size}kWh
                    </p>
                  </div>
                </div>

                {vehicle.range && (
                  <div className="mt-2 bg-emerald-50 p-2 rounded text-center">
                    <p className="text-emerald-700 text-sm font-medium">
                      Estimated range: {vehicle.range} km
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={calculateRouteHandler}
            className="w-full md:w-auto bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Calculate Route
          </button>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
        </div>

        {route && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-[600px]">
                <MapContainer
                  center={[40.0, -8.5]}
                  zoom={7}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Polyline
                    positions={route.coordinates}
                    color="#059669"
                    weight={3}
                  />
                  {route.coordinates.map((coord, index) => (
                    <Marker key={index} position={coord}>
                      <Popup>
                        <div className="text-sm font-medium">
                          {index === 0
                            ? "Start"
                            : index === route.coordinates.length - 1
                              ? "End"
                              : `Stop ${index}`}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Charging Stops
              </h2>
              {chargingStops.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="bg-emerald-100 rounded-full p-3 mb-4">
                      <LightningBoltIcon className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No Charging Stops Needed
                    </h3>
                    <p className="text-gray-600">
                      Your vehicle has enough battery capacity to complete this journey without requiring any charging stops.
                    </p>
                  </div>
                </div>
              ) : (
                chargingStops.map((stop, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-emerald-100 rounded-full p-2 mr-3">
                        <MapIcon className="h-6 w-6 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {stop.city}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {stop.chargingTime} minutes
                        </span>
                      </div>
                      <div className="flex items-center">
                        <CurrencyEuroIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          €{stop.cost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <LightningBoltIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {stop.batteryLevel}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

RoutePlanner.propTypes = {
  vehicle: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    brand: PropTypes.string,
    model: PropTypes.string,
    release_year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    usable_battery_size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    range: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image_url: PropTypes.string,
  }),
  setSelectedVehicle: PropTypes.func.isRequired,
  vehicles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      brand: PropTypes.string,
      model: PropTypes.string,
      release_year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      usable_battery_size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      range: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      image_url: PropTypes.string,
    })
  ).isRequired,
};

export default RoutePlanner;
