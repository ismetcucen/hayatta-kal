import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { cityStats } from '../data/cityData';
import 'leaflet/dist/leaflet.css';

function MapController({ onSelectCity }) {
    // Center map on Turkey
    return (
        <MapContainer
            center={[39.0, 35.0]}
            zoom={6}
            style={{ height: '100%', width: '100%', background: '#1e293b' }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {Object.entries(cityStats).map(([key, city]) => (
                <CircleMarker
                    key={key}
                    center={[city.lat, city.lng]}
                    radius={8}
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.6 }}
                    eventHandlers={{
                        click: () => onSelectCity(city)
                    }}
                >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent className="!bg-slate-900 !text-slate-100 !border !border-slate-600 !px-2 !py-1 !rounded !font-bold !text-xs">
                        {city.name}
                    </Tooltip>
                    <Popup className="text-slate-900">
                        <strong className="text-lg">{city.name}</strong><br />
                        Risk: {city.risk}
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}

export default MapController;
