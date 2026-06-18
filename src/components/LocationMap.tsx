import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface LocationMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  title?: string;
  zoom?: number;
  height?: string;
}

export function LocationMap({
  latitude = -23.9903,  // Tatuí, SP
  longitude = -48.0674,
  address = 'Tatuí, São Paulo',
  city = 'Tatuí',
  state = 'SP',
  title = 'Espalhe Melodias',
  zoom = 15,
  height = '400px',
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Google Maps API is available
    if (!window.google) {
      console.warn('Google Maps API not loaded');
      return;
    }

    if (!mapRef.current) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: latitude, lng: longitude },
      zoom: zoom,
      styles: [
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#523735' }],
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#f5f1e6' }],
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#c9b2a6' }],
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#dcd3d3' }],
        },
        {
          featureType: 'administrative.province',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#b3aea7' }],
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f1e6' }],
        },
        {
          featureType: 'landscape.man_made',
          elementType: 'geometry',
          stylers: [{ color: '#ede9e3' }],
        },
        {
          featureType: 'landscape.natural.terrain',
          elementType: 'geometry',
          stylers: [{ color: '#d6d2c5' }],
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#dfd2ae' }],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#a5b076' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#f5f1e6' }],
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{ color: '#fdfcf8' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#f8c967' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#e9bc62' }],
        },
        {
          featureType: 'road.local',
          elementType: 'geometry',
          stylers: [{ color: '#fbfbfb' }],
        },
        {
          featureType: 'transit.line',
          elementType: 'geometry',
          stylers: [{ color: '#e7e4d8' }],
        },
        {
          featureType: 'transit.station',
          elementType: 'geometry',
          stylers: [{ color: '#ede9e3' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#b3aea7' }],
        },
      ],
    });

    // Add marker
    const marker = new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: map,
      title: title,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#C4704A',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2,
      },
    });

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px; font-family: system-ui;">
          <h3 style="margin: 0 0 4px; font-weight: bold; color: #1F2937;">${title}</h3>
          <p style="margin: 0; font-size: 12px; color: #6B7280;">${address}</p>
        </div>
      `,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    // Open info window by default
    infoWindow.open(map, marker);
  }, [latitude, longitude, address, title, zoom]);

  return (
    <div className="space-y-4">
      <div
        ref={mapRef}
        className="w-full rounded-2xl border border-brand-sand shadow-md"
        style={{ height: height, minHeight: '300px' }}
      />
      <div className="flex items-start space-x-3 bg-brand-sand/30 p-4 rounded-xl border border-brand-sand/50">
        <MapPin className="w-5 h-5 text-brand-clay flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-brand-navy text-sm">{title}</p>
          <p className="text-xs text-slate-600 mt-0.5">{address}</p>
          <p className="text-xs text-slate-500 mt-1">
            {city}, {state} • Coordenadas: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Versão com fallback para quando Google Maps não está disponível
export function LocationMapWithFallback({
  latitude = -23.9903,
  longitude = -48.0674,
  address = 'Tatuí, São Paulo',
  city = 'Tatuí',
  state = 'SP',
  title = 'Espalhe Melodias',
  zoom = 15,
  height = '400px',
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isGoogleMapsAvailable, setIsGoogleMapsAvailable] = React.useState(false);

  useEffect(() => {
    setIsGoogleMapsAvailable(Boolean(window.google?.maps));
  }, []);

  if (!isGoogleMapsAvailable) {
    // Fallback: Static image or link
    return (
      <div className="space-y-4">
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(address)}/@${latitude},${longitude},${zoom}z`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-2xl border border-brand-sand shadow-md overflow-hidden hover:shadow-lg transition group"
          style={{ height: height, minHeight: '300px' }}
        >
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=1200x600&markers=color:0xC4704A%7C${latitude},${longitude}&key=AIzaSyDummy`}
            alt={title}
            className="w-full h-full object-cover group-hover:opacity-90 transition"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />
        </a>
        <div className="flex items-start space-x-3 bg-brand-sand/30 p-4 rounded-xl border border-brand-sand/50">
          <MapPin className="w-5 h-5 text-brand-clay flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-brand-navy text-sm">{title}</p>
            <p className="text-xs text-slate-600 mt-0.5">{address}</p>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-clay font-semibold hover:underline mt-2 inline-block"
            >
              Abrir no Google Maps
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LocationMap
      latitude={latitude}
      longitude={longitude}
      address={address}
      city={city}
      state={state}
      title={title}
      zoom={zoom}
      height={height}
    />
  );
}
