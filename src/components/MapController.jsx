import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import { cityStats } from '../data/cityData';
import 'leaflet/dist/leaflet.css';

function MapController({ onSelectCity, activeMission = 'hepsi' }) {
    // Center map on Turkey
    return (
        <MapContainer
            center={[39.0, 35.0]}
            zoom={6}
            style={{ height: '100%', width: '100%', background: '#1e293b' }}
        >
            <TileLayer
                url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                attribution='&copy; Google Maps'
            />

            {Object.entries(cityStats).map(([key, city]) => {
                const isActive = activeMission === 'hepsi' || city.dangerType === activeMission;

                let color = '#ef4444'; // Red default (Earthquake)
                if (city.dangerType === 'yangin') color = '#f97316'; // Orange
                if (city.dangerType === 'sel') color = '#0ea5e9'; // Blue
                if (city.dangerType === 'cig') color = '#a5f3fc'; // Cyan

                if (!isActive) color = '#334155'; // Gray 700

                return (
                    <CircleMarker
                        key={key}
                        center={[city.lat, city.lng]}
                        radius={isActive ? 12 : 6}
                        pathOptions={{
                            color: color,
                            fillColor: color,
                            fillOpacity: isActive ? 0.8 : 0.3,
                            weight: isActive ? 2 : 1
                        }}
                        eventHandlers={{
                            click: () => {
                                if (isActive) onSelectCity(city);
                            }
                        }}
                    >
                        {isActive && (
                            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent className="!bg-slate-900 !text-slate-100 !border !border-slate-600 !px-2 !py-1 !rounded !font-bold !text-xs !z-[400]">
                                {city.name}
                            </Tooltip>
                        )}

                        <Popup className="text-slate-900">
                            <strong className="text-lg">{city.name}</strong><br />
                            Risk: {city.risk} <br />
                            {!isActive && <span className="text-red-500 font-bold">Bu bölge mevcut görev kapsamında değil.</span>}
                        </Popup>
                    </CircleMarker>
                );
            })}
        </MapContainer>
    );
}

export default MapController;
