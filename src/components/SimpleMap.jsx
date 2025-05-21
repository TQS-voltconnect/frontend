import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function SimpleMap() {
  const [stations, setStations] = useState([]);

  // Busca estações da API
  useEffect(() => {
    axios.get('http://localhost:8080/api/stations')
      .then((res) => setStations(res.data))
      .catch((err) => console.error("Erro ao carregar estações:", err));
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer 
        center={[38.736946, -9.142685]}  // Centro do mapa (Lisboa)
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {/* Marcadores das estações */}
        {stations.map((station) => (
          <Marker 
            key={station.id} 
            position={[station.latitude, station.longitude]}
          >
            <Popup>
              <b>Estação #{station.id}</b> <br />
              Preço: {station.pricePerKWh} €/kWh <br />
              Carregadores: {station.numberOfChargers}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}