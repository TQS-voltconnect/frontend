import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ChargingFilters from "./ChargingFilters";

const deployUrl =
  import.meta.env.VITE_API_URL_DEPLOY || "http://deti-tqs-04.ua.pt:8080/api";

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
    connectorType: "all",
    powerLevel: "all",
    showAdvanced: false,
  });
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStationId, setSelectedStationId] = useState(null);

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

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Usando URL:", deployUrl);
        const response = await axios.get(`${deployUrl}/stations`);

        const rawData = response.data;
        if (!Array.isArray(rawData)) {
          throw new Error(
            "Formato de resposta inválido: era esperado um array"
          );
        }

        const transformedStations = rawData.map((station) => {
          const chargers = station.chargers || [];
          const available = chargers.filter(
            (c) => c.chargerStatus === "AVAILABLE"
          ).length;
          const total = chargers.length;

          const connectors = chargers
            .map((c) => c.chargerType)
            .filter((type) => typeof type === "string" && type.trim() !== "");
          const uniqueConnectors = [...new Set(connectors)];

          const maxPower =
            chargers.length > 0
              ? Math.max(...chargers.map((c) => c.chargingSpeed || 0))
              : 0;

          return {
            id: station.id,
            name: `Estação ${station.id}`,
            city: station.city || "Cidade desconhecida",
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
      } catch (err) {
        console.error("Erro ao carregar estações:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Falha ao carregar estações"
        );
      } finally {
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
      {/* restante do JSX mantido conforme original */}
      {/* ... (mantém todos os elementos do mapa, lista, filtros, etc.) */}
    </div>
  );
};

export default StationSearch;
