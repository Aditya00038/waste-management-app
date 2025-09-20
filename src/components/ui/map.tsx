'use client';

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapProps {
  center: [number, number]; // [latitude, longitude]
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    title?: string;
    icon?: string;
  }>;
  onClick?: (lat: number, lng: number) => void;
}

export function Map({ center, zoom = 13, markers = [], onClick }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    const initMap = async () => {
      // Check if API key exists
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key is not set. Map will not be initialized.');
        return;
      }
      
      // Initialize the loader with the API key
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
      });
      
      try {
        const google = await loader.load();
        const { Map } = google.maps;
        
        const mapInstance = new Map(mapRef.current!, {
          center: { lat: center[0], lng: center[1] },
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        
        mapInstanceRef.current = mapInstance;
        
        // Add markers
        markers.forEach(marker => {
          const newMarker = new google.maps.Marker({
            position: { lat: marker.position[0], lng: marker.position[1] },
            map: mapInstance,
            title: marker.title,
            icon: marker.icon,
          });
          markersRef.current.push(newMarker);
        });
        
        // Add click handler
        if (onClick) {
          mapInstance.addListener('click', (event: any) => {
            const lat = event.latLng?.lat() || 0;
            const lng = event.latLng?.lng() || 0;
            onClick(lat, lng);
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };
    
    initMap();
    
    return () => {
      // Clean up markers when the component unmounts
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);
  
  // Update markers when they change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Clean up existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add new markers
    const googleInstance = (window as any).google;
    if (googleInstance && googleInstance.maps) {
      markers.forEach(marker => {
        const newMarker = new googleInstance.maps.Marker({
          position: { lat: marker.position[0], lng: marker.position[1] },
          map: mapInstanceRef.current!,
          title: marker.title,
          icon: marker.icon,
        });
        markersRef.current.push(newMarker);
      });
    }
  }, [markers]);
  
  // Update center and zoom when they change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    mapInstanceRef.current.setCenter({ lat: center[0], lng: center[1] });
    mapInstanceRef.current.setZoom(zoom);
  }, [center, zoom]);
  
  return (
    <div 
      ref={mapRef} 
      className="h-full w-full min-h-[200px]"
      aria-label="Map"
    />
  );
}
