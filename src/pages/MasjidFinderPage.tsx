import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Clock, 
  Star,
  Users
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// Fix for default marker icons in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Emerald Icon for Masjids
const createMasjidIcon = (isSelected: boolean) => L.divIcon({
  html: `
    <div class="flex items-center justify-center">
      <div class="p-2 rounded-full border-2 border-white shadow-lg transition-all duration-300 ${isSelected ? 'bg-[#10b981] scale-125 z-10' : 'bg-[#10b981]/80'} text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? '18' : '14'}" height="${isSelected ? '18' : '14'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

interface MasjidPlace {
  id: string;
  displayName: string;
  location: { lat: number, lng: number };
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MasjidSearch({ 
  onPlacesFound, 
  onPlaceSelect,
  userLocation
}: { 
  onPlacesFound: (places: MasjidPlace[]) => void;
  onPlaceSelect: (place: MasjidPlace) => void;
  userLocation: { lat: number, lng: number } | null;
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchPhoton = async (q: string) => {
    if (!q) return;
    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`;
    if (userLocation) {
      url += `&lat=${userLocation.lat}&lon=${userLocation.lng}`;
    }
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      setSuggestions(data.features || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Photon search failed:", error);
    }
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 2) {
      searchPhoton(val);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    const name = feature.properties.name || feature.properties.street || "Selected Location";
    const address = [
      feature.properties.street,
      feature.properties.city,
      feature.properties.country
    ].filter(Boolean).join(', ');

    const place: MasjidPlace = {
      id: `${lat}-${lng}`,
      displayName: name,
      location: { lat, lng },
      formattedAddress: address || "No address details available",
      primaryType: feature.properties.osm_value
    };

    onPlaceSelect(place);
    setQuery(name);
    setShowSuggestions(false);
  };

  const searchNearby = async () => {
    if (!userLocation) return;
    
    // Photon doesn't have a specific "nearby masjids" endpoint like Google, 
    // but we can search for "mosque" with proximity.
    const url = `https://photon.komoot.io/api/?q=mosque&lat=${userLocation.lat}&lon=${userLocation.lng}&limit=20`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const foundPlaces: MasjidPlace[] = data.features.map((f: any) => ({
        id: f.properties.osm_id?.toString() || `${f.geometry.coordinates[1]}-${f.geometry.coordinates[0]}`,
        displayName: f.properties.name || "Mosque",
        location: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] },
        formattedAddress: [
          f.properties.street,
          f.properties.city,
          f.properties.country
        ].filter(Boolean).join(', ') || "Address not found",
        primaryType: f.properties.osm_value
      }));
      
      onPlacesFound(foundPlaces);
    } catch (error) {
      console.error("Photon nearby search failed:", error);
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000]">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => query.length > 2 && setShowSuggestions(true)}
            placeholder="Search for a Masjid..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald text-sm dark:text-white"
          />
          
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[1001]"
              >
                {suggestions.map((s, idx) => (
                  <button
                    key={`${s.properties.osm_id}-${idx}`}
                    onClick={() => handleSuggestionSelect(s)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors flex items-start gap-3 border-b border-slate-100 dark:border-zinc-800 last:border-0"
                  >
                    <MapPin className="text-brand-emerald shrink-0 mt-1" size={16} />
                    <div>
                      <p className="text-sm font-bold dark:text-white">{s.properties.name || s.properties.street}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {[s.properties.city, s.properties.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button 
          onClick={searchNearby}
          className="px-4 py-3 bg-brand-emerald text-white rounded-2xl shadow-xl hover:bg-emerald-600 transition-colors"
          title="Search Nearby"
        >
          <Navigation size={20} />
        </button>
      </div>
    </div>
  );
}

export default function MasjidFinderPage() {
  const [places, setPlaces] = useState<MasjidPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([3.1390, 101.6869]); // Default KL
  const [mapZoom, setMapZoom] = useState(13);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          };
          setUserLocation(loc);
          setMapCenter([loc.lat, loc.lng]);
        },
        (error) => {
          console.error("Geolocation failed:", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const handlePlaceSelect = (place: MasjidPlace) => {
    setSelectedPlaceId(place.id);
    setMapCenter([place.location.lat, place.location.lng]);
    setMapZoom(16);
    if (!places.find(p => p.id === place.id)) {
      setPlaces(prev => [place, ...prev]);
    }
  };

  const handleSidebarClick = (place: MasjidPlace) => {
    setSelectedPlaceId(place.id);
    setMapCenter([place.location.lat, place.location.lng]);
    setMapZoom(16);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
      {/* Mobile View Toggle */}
      <div className="flex md:hidden bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm self-center shrink-0">
        <button 
          onClick={() => setViewMode('map')}
          className={cn(
            "px-5 py-1.5 rounded-xl text-[10px] font-bold transition-all",
            viewMode === 'map' ? "bg-brand-emerald text-white shadow-lg shadow-emerald-500/10" : "text-slate-500"
          )}
        >
          Map
        </button>
        <button 
          onClick={() => setViewMode('list')}
          className={cn(
            "px-5 py-1.5 rounded-xl text-[10px] font-bold transition-all",
            viewMode === 'list' ? "bg-brand-emerald text-white shadow-lg shadow-emerald-500/10" : "text-slate-500"
          )}
        >
          List
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4 h-full overflow-hidden">
        {/* Map Container */}
        <div className={cn(
          "flex-1 relative rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xl bg-slate-200 dark:bg-zinc-800 z-0 transition-all duration-300",
          viewMode === 'list' && "hidden md:block"
        )}>
          <MasjidSearch 
            onPlacesFound={setPlaces} 
            onPlaceSelect={handlePlaceSelect} 
            userLocation={userLocation}
          />
          
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ width: '100%', height: '100%', zIndex: 0 }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} zoom={mapZoom} />
            
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {places.map(place => (
              <Marker 
                key={place.id} 
                position={[place.location.lat, place.location.lng]}
                icon={createMasjidIcon(selectedPlaceId === place.id)}
                eventHandlers={{
                  click: () => setSelectedPlaceId(place.id)
                }}
              >
                <Popup>
                  <div className="p-2 max-w-[200px] space-y-1.5">
                    <h3 className="font-bold text-xs text-zinc-900 !m-0">{place.displayName}</h3>
                    {place.primaryType && (
                      <span className="inline-block text-[8px] text-brand-emerald bg-emerald-50 px-1.5 py-0.5 rounded-full capitalize">
                        {place.primaryType.replace('_', ' ')}
                      </span>
                    )}
                    <p className="text-[10px] text-slate-500 leading-tight !m-0">{place.formattedAddress}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* List View */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 flex flex-col gap-3 md:gap-4 overflow-hidden transition-all duration-300",
          viewMode === 'map' && "hidden md:flex"
        )}>
          <div className="flex-1 flex flex-col p-3 md:p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[1.5rem] md:rounded-[2rem] shadow-sm overflow-hidden">
            <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2 dark:text-white shrink-0 text-sm md:text-base">
              <Users size={16} className="text-brand-emerald" />
              Nearby Masjids
            </h3>
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {places.length > 0 ? places.map((place) => (
                <motion.button
                  key={place.id}
                  whileHover={{ x: 2 }}
                  onClick={() => handleSidebarClick(place)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl transition-all border-2",
                    selectedPlaceId === place.id 
                      ? "bg-brand-emerald/10 border-brand-emerald" 
                      : "bg-slate-50 dark:bg-zinc-800 border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                  )}
                >
                  <p className={cn(
                    "font-bold text-xs md:text-sm truncate",
                    selectedPlaceId === place.id ? "text-brand-emerald" : "dark:text-zinc-200"
                  )}>
                    {place.displayName}
                  </p>
                  <p className="text-[9px] text-slate-500 line-clamp-1 opacity-70">{place.formattedAddress}</p>
                </motion.button>
              )) : (
                <div className="text-center py-6 space-y-2">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Search size={20} />
                  </div>
                  <p className="text-[10px] text-slate-500">Searching Masjids...</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 md:p-4 bg-brand-emerald text-white rounded-[1.5rem] md:rounded-[2rem] shadow-lg shadow-emerald-500/10">
            <h3 className="font-bold text-xs mb-1.5 flex items-center gap-2">
              <Clock size={14} />
              Jumua Timings
            </h3>
            <p className="text-[10px] opacity-90 leading-snug">Most Masjids perform Jumua at 1:15 & 1:30 PM. See local mosque notices for details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
