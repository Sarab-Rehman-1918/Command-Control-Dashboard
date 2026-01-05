import React, { useEffect, useState, useRef } from 'react';
import { buses, routes } from '../api';
import {
  Bus,
  RefreshCw
} from 'lucide-react';

/**
 * EXPECTED BACKEND APIs
 *
 * GET /routes
 * → [{ route_id, name, is_active }]
 *
 * GET /routes/:routeId/stops
 * → [{ stop_id, name, latitude, longitude, sequence_number }]
 *
 * GET /buses/locations
 * → [{ bus_id, route_id, latitude, longitude, status }]
 */

const LAHORE_CENTER = { lat: 31.5204, lng: 74.3587 };

const LiveMap = () => {
  const mapRef = useRef(null);
  const googleMap = useRef(null);

  const [routeList, setRouteList] = useState([]);
  const [routeStops, setRouteStops] = useState({});
  const [busLocations, setBusLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD GOOGLE MAP ---------------- */
  useEffect(() => {
    if (!window.google) return;

    googleMap.current = new window.google.maps.Map(mapRef.current, {
      center: LAHORE_CENTER,
      zoom: 12,
      mapTypeId: 'roadmap',
    });

    fetchAllData();
  }, []);

  /* ---------------- FETCH ALL DATA ---------------- */
  const fetchAllData = async () => {
    try {
      const [routesRes, busesRes] = await Promise.all([
        routes.getAll(),
        buses.getLocations()
      ]);

      setRouteList(routesRes.data);
      setBusLocations(normalizeCoords(busesRes.data));

      await fetchStopsForRoutes(routesRes.data);
      setLoading(false);
    } catch (err) {
      console.error('LiveMap error:', err);
      setLoading(false);
    }
  };

  /* ---------------- FETCH STOPS PER ROUTE ---------------- */
  const fetchStopsForRoutes = async (routesData) => {
    const stopsMap = {};

    for (const route of routesData) {
      const res = await routes.getStops(route.route_id);

      stopsMap[route.route_id] = res.data
        .sort((a, b) => a.sequence_number - b.sequence_number)
        .map(s => ({
          ...s,
          lat: Number(s.latitude),
          lng: Number(s.longitude),
        }));
    }

    setRouteStops(stopsMap);
    drawRoutes(stopsMap);
  };

  /* ---------------- DRAW ROUTE POLYLINES ---------------- */
  const drawRoutes = (stopsMap) => {
    Object.keys(stopsMap).forEach((routeId, index) => {
      const path = stopsMap[routeId].map(s => ({
        lat: s.lat,
        lng: s.lng
      }));

      new window.google.maps.Polyline({
        path,
        map: googleMap.current,
        strokeColor: getRouteColor(index),
        strokeOpacity: 0.9,
        strokeWeight: 5
      });

      drawStops(stopsMap[routeId]);
    });
  };

  /* ---------------- DRAW STOPS ---------------- */
  const drawStops = (stops) => {
    stops.forEach(stop => {
      new window.google.maps.Circle({
        map: googleMap.current,
        center: { lat: stop.lat, lng: stop.lng },
        radius: 80,
        fillColor: '#2563eb',
        fillOpacity: 0.7,
        strokeWeight: 1,
      });
    });
  };

  /* ---------------- DRAW BUSES ---------------- */
  useEffect(() => {
    if (!googleMap.current) return;

    busLocations.forEach(bus => {
      new window.google.maps.Marker({
        position: {
          lat: bus.latitude,
          lng: bus.longitude
        },
        map: googleMap.current,
        icon: {
          url: '/bus-icon.png',
          scaledSize: new window.google.maps.Size(35, 35),
        },
      });
    });
  }, [busLocations]);

  /* ---------------- HELPERS ---------------- */
  const normalizeCoords = (data) =>
    data.map(d => ({
      ...d,
      latitude: Number(d.latitude),
      longitude: Number(d.longitude),
    }));

  const getRouteColor = (i) =>
    ['#16a34a', '#2563eb', '#ea580c', '#9333ea'][i % 4];

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Live Bus Map – Lahore</h1>
        <button
          onClick={fetchAllData}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <div
        ref={mapRef}
        className="w-full h-[500px] rounded shadow"
      />

      <div className="grid grid-cols-4 gap-4">
        {busLocations.map(bus => (
          <div key={bus.bus_id} className="bg-white p-3 rounded shadow">
            <div className="flex items-center space-x-2">
              <Bus className="text-blue-600" />
              <span className="font-semibold">Bus {bus.bus_id}</span>
            </div>
            <div className="text-xs mt-1">
              Lat: {bus.latitude.toFixed(5)} <br />
              Lng: {bus.longitude.toFixed(5)}
            </div>
          </div>
        ))}
      </div>

      {loading && <p className="text-gray-500">Loading map data…</p>}
    </div>
  );
};

export default LiveMap;
