import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

export interface GoogleMapProps {
  title?: string;
  address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: string;
  className?: string;
  showLink?: boolean;
}

/**
 * GoogleMap Component
 * Renders an embedded Google Map for event locations.
 * Uses iframe embed for simplicity (no API key required).
 */
export function GoogleMap({
  title,
  address,
  city,
  state,
  latitude,
  longitude,
  zoom = 15,
  height = '300px',
  className = '',
  showLink = true,
}: GoogleMapProps) {
  // Construct full address for search
  const fullAddress = `${address}, ${city}, ${state}`;
  const encodedAddress = encodeURIComponent(fullAddress);

  // Google Maps search URL (opens in new tab)
  const mapsSearchUrl = `https://www.google.com/maps/search/${encodedAddress}`;

  // Google Maps embed URL for directions query
  const embedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.0000000000000!2d-46.84!3d-23.40!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${encodedAddress}!2zTG9jYXvDo28!5e0!3m2!1spt-BR!2sbr!4v1234567890`;

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}

      {/* Map Container */}
      <div
        className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
        style={{ minHeight: height }}
      >
        <iframe
          width="100%"
          height={height}
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen={true}
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          className="w-full h-full"
        />
      </div>

      {/* Address and Link */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {address}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {city}, {state}
            </p>
          </div>
        </div>

        {/* Google Maps Link */}
        {showLink && (
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Abrir no Google Maps"
          >
            <span>Abrir</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default GoogleMap;
