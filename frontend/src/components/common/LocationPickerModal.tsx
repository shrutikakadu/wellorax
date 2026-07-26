import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search, Check, Loader2 } from 'lucide-react';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onLocationSave: (address: string) => void;
}

interface AddressFormState {
  flatNo: string;
  buildingName: string;
  street: string;
  landmark: string;
  area: string;
  city: string;
  pincode: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onLocationSave,
}) => {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Address fields form
  const [formState, setFormState] = useState<AddressFormState>({
    flatNo: '',
    buildingName: '',
    street: '',
    landmark: '',
    area: '',
    city: '',
    pincode: '',
  });

  // Parse current location text into form state if it contains comma-separated values
  useEffect(() => {
    if (isOpen && currentLocation) {
      const parts = currentLocation.split(',').map(p => p.trim());
      if (parts.length > 2) {
        setFormState({
          flatNo: parts[0] || '',
          buildingName: parts[1] || '',
          street: parts[2] || '',
          landmark: parts.find(p => p.toLowerCase().includes('near') || p.toLowerCase().includes('opp')) || '',
          area: parts[3] || '',
          city: parts[4] || '',
          pincode: parts.find(p => /^\d{6}$/.test(p)) || '',
        });
      } else {
        // Fallback: put the raw address in the street field
        setFormState(prev => ({
          ...prev,
          street: currentLocation,
        }));
      }
    }
  }, [isOpen, currentLocation]);

  // Load Leaflet dynamically
  useEffect(() => {
    if (!isOpen) return;

    // Load CSS
    let cssLink = document.getElementById('leaflet-css') as HTMLLinkElement;
    if (!cssLink) {
      cssLink = document.createElement('link');
      cssLink.id = 'leaflet-css';
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(cssLink);
    }

    // Load JS
    let jsScript = document.getElementById('leaflet-js') as HTMLScriptElement;
    if (!jsScript) {
      jsScript = document.createElement('script');
      jsScript.id = 'leaflet-js';
      jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      jsScript.async = true;
      document.head.appendChild(jsScript);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      // Clear previous instance
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }

      // Default coords (Mumbai Tech District area, around BKC/Powai or Bangalore Tech Park)
      const defaultLat = 19.0760;
      const defaultLng = 72.8777;

      try {
        // Create map
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        }).setView([defaultLat, defaultLng], 13);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(mapRef.current);

        // Custom icon for a premium look
        const pinIcon = L.divIcon({
          html: `<div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <div class="relative w-8 h-8 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center shadow-lg">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
              </svg>
            </div>
          </div>`,
          className: 'custom-pin-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        // Add draggable marker
        markerRef.current = L.marker([defaultLat, defaultLng], {
          draggable: true,
          icon: pinIcon,
        }).addTo(mapRef.current);

        // Marker dragend event
        markerRef.current.on('dragend', () => {
          const position = markerRef.current.getLatLng();
          mapRef.current.panTo(position);
          reverseGeocode(position.lat, position.lng);
        });

        // Map click event to relocate marker
        mapRef.current.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.panTo([lat, lng]);
          reverseGeocode(lat, lng);
        });

        // Attempt initial reverse geocoding
        reverseGeocode(defaultLat, defaultLng);
      } catch (err) {
        console.error("Map initialization failed: ", err);
      }
    };

    if ((window as any).L) {
      // Give DOM a tick to render map container
      setTimeout(initMap, 50);
    } else {
      jsScript.addEventListener('load', initMap);
    }

    return () => {
      if (jsScript) {
        jsScript.removeEventListener('load', initMap);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  // Reverse geocode lat,lng using OpenStreetMap Nominatim API
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        setFormState(prev => ({
          ...prev,
          buildingName: addr.building || addr.suburb || prev.buildingName || '',
          street: addr.road || addr.suburb || addr.neighbourhood || prev.street || '',
          area: addr.suburb || addr.city_district || addr.county || prev.area || '',
          city: addr.city || addr.town || addr.state || prev.city || '',
          pincode: addr.postcode || prev.pincode || '',
        }));
      }
    } catch (err) {
      console.error("OSM Nominatim Reverse Geocoding Error:", err);
    }
  };

  // Search address using OSM Nominatim API
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMessage('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await res.json();
      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
        setErrorMessage('No results found. Try search with city name.');
      }
    } catch (err) {
      setErrorMessage('Search service failed. Please try again.');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a search result
  const handleSelectResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lon], 15);
      markerRef.current.setLatLng([lat, lon]);
      reverseGeocode(lat, lon);
    }

    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  // Detect live GPS location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
          reverseGeocode(latitude, longitude);
        }
        setIsDetecting(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setErrorMessage('Failed to detect GPS. Please check location permissions.');
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle Form Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit and Save Address
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const { flatNo, buildingName, street, landmark, area, city, pincode } = formState;

    if (!street || !area || !city) {
      setErrorMessage('Please fill in Street, Area, and City fields.');
      return;
    }

    // Compose final address string nicely
    const addressParts = [
      flatNo ? `Flat ${flatNo}` : '',
      buildingName,
      street,
      landmark ? `Near ${landmark}` : '',
      area,
      city,
      pincode,
    ].filter(part => part.trim() !== '');

    const finalAddress = addressParts.join(', ');
    onLocationSave(finalAddress);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F7F5] dark:bg-[#07130F] flex flex-col h-screen w-screen overflow-hidden font-sans animate-in fade-in duration-200">
      {/* Fullscreen Navbar Header */}
      <header className="h-16 shrink-0 bg-white dark:bg-[#091F17] border-b border-slate-200/80 dark:border-emerald-500/10 px-4 md:px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-emerald-950/40 text-slate-700 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-all font-bold text-xs cursor-pointer"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit']">Select Delivery Location</h2>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANEL: Interactive Map & Search */}
        <div className="w-full md:w-1/2 flex flex-col h-[40vh] md:h-full border-r border-slate-100 dark:border-emerald-500/10 bg-slate-50 dark:bg-slate-900/40 relative">
          
          {/* Map container */}
          <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[180px] z-10" />

          {/* Floated Search Overlay */}
          <div className="absolute top-4 left-4 right-12 z-20 space-y-1">
            <form onSubmit={handleSearchSubmit} className="flex gap-1.5 bg-white dark:bg-slate-950 p-1.5 rounded-2xl shadow-lg border border-slate-200/80 dark:border-emerald-500/20">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search locality, tech park, city..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-transparent border-0 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Find'}
              </button>
            </form>

            {/* Autocomplete Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-emerald-500/20 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-in slide-in-from-top-1">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectResult(result)}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPS Float button */}
          <button
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="absolute bottom-4 right-4 z-20 p-2.5 rounded-2xl bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 border border-slate-200 dark:border-emerald-500/20 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            title="Locate via GPS"
            type="button"
          >
            {isDetecting ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <Navigation className="w-4 h-4 fill-emerald-500/10" />}
          </button>
        </div>

        {/* RIGHT PANEL: Detailed Delivery Address Form */}
        <div className="w-full md:w-1/2 flex flex-col h-[60vh] md:h-full p-6 md:p-8 overflow-y-auto bg-white dark:bg-[#0B1F1A]">
          <div className="mb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Confirm Delivery Address</span>
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
              Confirm or refine the map coordinates address details below
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-semibold leading-relaxed animate-in fade-in">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              {/* Row 1: Flat/House No & Building Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Flat / House / Suite</label>
                  <input
                    type="text"
                    name="flatNo"
                    placeholder="e.g. 402-B, Block 4"
                    value={formState.flatNo}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Building / Apt Name</label>
                  <input
                    type="text"
                    name="buildingName"
                    placeholder="e.g. Tech District Heights"
                    value={formState.buildingName}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Street Address */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Street / Road / Lane *</label>
                <input
                  type="text"
                  name="street"
                  required
                  placeholder="e.g. 12th Main Road, Sector 4"
                  value={formState.street}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Row 3: Landmark */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Landmark (Optional)</label>
                <input
                  type="text"
                  name="landmark"
                  placeholder="e.g. Opposite Cyber Park"
                  value={formState.landmark}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Row 4: Area, City, Pin Code */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Area / Locality *</label>
                  <input
                    type="text"
                    name="area"
                    required
                    placeholder="e.g. Indiranagar"
                    value={formState.area}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Bangalore"
                    value={formState.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Pin Code</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="e.g. 560038"
                    value={formState.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 mt-auto">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save & Confirm Location</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
