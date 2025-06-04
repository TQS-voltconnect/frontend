import axios from "axios";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ChargingFilters from "./ChargingFilters";
import StationListItem from "./StationListItem";
import PropTypes from "prop-types";
import { baseUrl } from "../consts";

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
    availableOnly: false,
    connectorType: "all",
    powerLevel: "all",
    showAdvanced: false,
  });
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [stationReviewMap, setStationReviewMap] = useState({});
  const [showModalStationId, setShowModalStationId] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  console.log(allReviews);

  const ZoomToStation = ({ coordinates, stationId, selectedStationId }) => {
    const map = useMap();

    useEffect(() => {
      if (coordinates && stationId === selectedStationId) {
        map.flyTo(coordinates, 10, {
          animate: true,
          duration: 1,
        });
      }
    }, [coordinates, map, stationId, selectedStationId]);

    return null;
  };

  ZoomToStation.propTypes = {
    coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
    stationId: PropTypes.string.isRequired,
    selectedStationId: PropTypes.string.isRequired,
  };

  const greenBoltIcon = L.divIcon({
    className: "",
    html: `
      <svg width="30" height="40" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="#16A34A" d="M12 0L3 14h7v18l9-22h-7z"/>
      </svg>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  });

  const getAvailableChargers = (chargers) => {
    return chargers.filter((c) => c.chargerStatus === "AVAILABLE").length;
  };

  const getUniqueConnectors = (chargers) => {
    const connectors = chargers
      .map((c) => c.chargerType)
      .filter((type) => typeof type === "string" && type.trim() !== "");
    return [...new Set(connectors)];
  };

  const getMaxPower = (chargers) => {
    return chargers.length > 0
      ? Math.max(...chargers.map((c) => c.chargingSpeed || 0))
      : 0;
  };

  useEffect(() => {
    const fetchStationsAndReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${baseUrl}/stations`);
        const rawData = response.data;
        if (!Array.isArray(rawData)) {
          throw new Error("Response format invalid: expected an array");
        }
        const transformedStations = rawData.map((station) => {
          const chargers = station.chargers || [];
          const available = getAvailableChargers(chargers);
          const total = chargers.length;
          const uniqueConnectors = getUniqueConnectors(chargers);
          const maxPower = getMaxPower(chargers);
          return {
            id: station.id,
            name: `Station ${station.id}`,
            city: station.city || "Unknown City",
            address: `Operador ${station.operatorId}`,
            coordinates:
              Array.isArray(station.location) && station.location.length === 2
                ? [station.location[0], station.location[1]]
                : [38.7223, -9.1393],
            available,
            total,
            connectors: uniqueConnectors,
            power: `${maxPower} kW`,
            rating: "4.5",
          };
        });
        setStations(transformedStations);
        const reviewsRes = await fetch(`${baseUrl}/reviews`);
        const allReviewsData = await reviewsRes.json();
        setAllReviews(allReviewsData);
        const map = {};
        for (const station of transformedStations) {
          const reviews = allReviewsData.filter(r => r.chargingStationId === station.id);
          const avg = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : null;
          map[station.id] = { avgRating: avg, reviews };
        }
        setStationReviewMap(map);
      } catch (err) {
        console.error("Error loading stations or reviews:", err);
        setError(err.message || "Failed to load stations or reviews");
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    };
    fetchStationsAndReviews();
  }, []);

  const handleFilterChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      station.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAvailability = !filters.availableOnly || station.available > 0;

    let matchesChargerType = true;
    if (filters.connectorType !== "all") {
      const connectors = Array.isArray(station.connectors)
        ? station.connectors
        : [];
      matchesChargerType = connectors.includes(filters.connectorType);
    }

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
        <div className="md:w-2/3 h-96 md:h-auto rounded-lg overflow-hidden shadow map-container">
          <MapContainer
            center={[41.5, -8.5]}
            zoom={5.5}
            minZoom={5.5}
            scrollWheelZoom={true}
            maxBounds={[
              [36.8, -10.0],
              [42.3, -5.5],
            ]}
            maxBoundsViscosity={1.0}
            style={{ height: "100%", width: "100%" }}
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
                eventHandlers={{
                  click: () => setSelectedStationId(station.id),
                }}
              >
                <Popup offset={[0, -20]}>
                  <div className="text-sm">
                    <strong>{station.name}</strong>
                    <p>{station.city}</p>
                    <p>
                      {station.available}/{station.total} available
                    </p>
                    <p>{station.power}</p>
                  </div>
                </Popup>
                <ZoomToStation
                  coordinates={station.coordinates}
                  stationId={station.id}
                  selectedStationId={selectedStationId}
                />
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
              <StationListItem
                key={station.id}
                station={station}
                isSelected={selectedStationId === station.id}
                onSelect={setSelectedStationId}
                reviews={stationReviewMap[station.id]?.reviews || []}
                avgRating={stationReviewMap[station.id]?.avgRating}
                reviewsLoading={reviewsLoading}
                showModal={showModalStationId === station.id}
                setShowModal={open => setShowModalStationId(open ? station.id : null)}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StationSearch;
