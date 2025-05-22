import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

// Fix para ícones padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function SimpleMap() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8080/api/stations')
      .then((res) => {
        console.log('Dados recebidos:', res.data); // Verifique os dados no console
        setStations(res.data);
      })
      .catch((err) => console.error("Erro ao carregar estações:", err));
  }, []);

  const validStations = stations.filter(station => 
    station.location && 
    Array.isArray(station.location) && 
    station.location.length === 2
  );

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer 
        center={[39.5, -8.0]} // Centro aproximado de Portugal
        zoom={6}              // Zoom que abrange a maioria do território
        style={{ height: '100%', width: '100%' }}
>

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {validStations.map((station) => (
          <Marker 
            key={station.id} 
            position={[station.location[0], station.location[1]]}
          >
            <Popup>
              <div>
                <h3>Estação #{station.id}</h3>
                <p>Operador: {station.operatorId}</p>
                <p>Carregadores: {station.chargers?.length || 0}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}