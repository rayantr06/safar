"use client";

import { useEffect, useRef } from "react";

interface MapComponentProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title?: string;
    description?: string;
  }>;
  route?: Array<[number, number]>;
}

export default function MapComponent({
  center,
  zoom = 13,
  markers = [],
  route,
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let active = true;

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!active || !mapContainerRef.current || mapInstanceRef.current) return;

      // Fix marker icons
      // Leaflet's default icon paths are broken in web bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current).setView(center, zoom);
      mapInstanceRef.current = map;

      // Use a beautiful custom tileset: CartoDB Positron (clean, light, minimal)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      // Add markers
      markers.forEach((m) => {
        const marker = L.marker(m.position).addTo(map);
        if (m.title) {
          marker.bindPopup(`<strong>${m.title}</strong>${m.description ? `<br/>${m.description}` : ""}`);
        }
      });

      // Add route line if provided
      if (route && route.length > 0) {
        const polyline = L.polyline(route, { color: "#0ea5e9", weight: 4, opacity: 0.8 }).addTo(map);
        map.fitBounds(polyline.getBounds());
      }
    }

    initMap();

    return () => {
      active = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, markers, route]);

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-outline-variant/10 shadow-md">
      <div ref={mapContainerRef} className="w-full h-full z-10 min-h-[300px]" />
    </div>
  );
}
