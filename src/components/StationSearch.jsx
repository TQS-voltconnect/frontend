import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ChargingFilters from "./ChargingFilters";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const StationSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    availableOnly: true,
    chargerType: "all",
    powerLevel: "all",
    showAdvanced: false,
  });
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const greenBoltIcon = L.divIcon({
    className: "",
    html: `
      <svg width="30" height="40" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#16A34A" d="M12 0L3 14h7v18l9-22h-7z"/>
        <path fill="white" d="M11 2l-7 12h6v16l9-20h-6z"/>
      </svg>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/stations");
        console.log("Stations:", response.data);

        // Transformar os dados para o formato esperado pelo componente
        const transformedStations = response.data.map((station) => {
          // Calcular disponibilidade (quantos carregadores estão disponíveis)
          const available = station.chargers.filter(
            (c) => c.chargerStatus === "AVAILABLE"
          ).length;
          const total = station.chargers.length;

          // Extrair tipos de conectores únicos
          const connectors = [
            ...new Set(station.chargers.map((c) => c.chargerType)),
          ];

          // Calcular velocidade máxima de carregamento
          const maxPower = Math.max(
            ...station.chargers.map((c) => c.chargingSpeed)
          );

          return {
            id: station.id,
            name: `Station ${station.id}`,
            address: `Operator ${station.operatorId}`,
            coordinates: station.location
              ? [station.location[0], station.location[1]]
              : [38.7223, -9.1393],
            available,
            total,
            connectors,
            power: `${maxPower} kW`,
            rating: "4.5",
            distance: "0.5 km",
          };
        });

        setStations(transformedStations);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stations:", err);
        setError("Failed to load stations");
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleAdvanced = () => {
    setFilters((prev) => ({
      ...prev,
      showAdvanced: !prev.showAdvanced,
    }));
  };

  const filteredStations = stations.filter((station) => {
    if (!station) return false;

    const matchesSearch =
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAvailability = !filters.availableOnly || station.available > 0;

    const matchesChargerType =
      filters.chargerType === "all" ||
      station.connectors.includes(filters.chargerType);

    let matchesPower = true;
    if (filters.powerLevel !== "all") {
      const stationPower = parseFloat(station.power);
      if (filters.powerLevel === "low") matchesPower = stationPower <= 22;
      else if (filters.powerLevel === "medium")
        matchesPower = stationPower > 22 && stationPower <= 50;
      else if (filters.powerLevel === "high") matchesPower = stationPower > 50;
    }

    return (
      matchesSearch && matchesAvailability && matchesChargerType && matchesPower
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading stations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white pt-6 pb-4 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Find Charging Stations
          </h1>

          <div className="mb-2 relative rounded-md shadow-sm">
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
              placeholder="Search by location or station name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search stations"
            />
          </div>

          <ChargingFilters
            filters={filters}
            onChange={handleFilterChange}
            showAdvanced={filters.showAdvanced}
            toggleAdvanced={toggleAdvanced}
          />
        </div>
      </div>

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6"
        style={{ minHeight: "600px" }}
      >
        <div className="md:w-2/3 h-96 md:h-auto rounded-lg overflow-hidden shadow">
          <MapContainer
            center={[38.7223, -9.1393]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredStations.map((station) => (
              <Marker
                key={station.id}
                position={station.coordinates}
                icon={greenBoltIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{station.name}</h3>
                    <p>{station.address}</p>
                    <p>
                      {station.available}/{station.total} chargers available
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {station.connectors.map((connector, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {connector}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={`/stations/${station.id}`}
                      className="text-emerald-600 hover:underline block mt-2"
                    >
                      View details
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div
          className="md:w-1/3 bg-white rounded-lg shadow overflow-y-auto"
          style={{ maxHeight: "600px" }}
        >
          <h2 className="text-lg font-medium text-gray-900 px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            {filteredStations.length}{" "}
            {filteredStations.length === 1 ? "Station" : "Stations"} Found
          </h2>
          <ul className="divide-y divide-gray-200">
            {filteredStations.map((station) => (
              <li
                key={station.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-emerald-600">
                      {station.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {station.address}
                    </p>
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
                  <span>{station.distance}</span>
                  <span>•</span>
                  <span>{station.power}</span>
                  <span>•</span>
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
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StationSearch;
