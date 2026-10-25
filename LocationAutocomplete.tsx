import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, X, Search, Check } from 'lucide-react';

export interface LocationAutocompleteProps {
  label: string;
  isPickup: boolean;
  value: string;
  isGpsActive?: boolean;
  userGps?: {
    lat: number | null;
    lng: number | null;
    accuracy?: number | null;
    isTracking?: boolean;
  };
  onLocateGps?: () => void;
  onChangeLocation: (name: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
}

interface PlaceItem {
  name: string;
  category: 'stand' | 'hospital' | 'station' | 'market' | 'admin';
  categoryLabel: string;
  lat: number;
  lng: number;
}

const GAFARGAON_POPULAR_PLACES: PlaceItem[] = [
  { name: 'গফরগাঁও নতুন বাজার স্ট্যান্ড', category: 'stand', categoryLabel: 'প্রধান স্ট্যান্ড', lat: 24.4340, lng: 90.5510 },
  { name: 'পাগলা থানা মোড় স্ট্যান্ড', category: 'stand', categoryLabel: 'পাগলা থানা', lat: 24.3410, lng: 90.5312 },
  { name: 'দত্তের বাজার জংশন মোড়', category: 'stand', categoryLabel: 'বাজার', lat: 24.4120, lng: 90.5840 },
  { name: 'জামতলা মোড় ও বাস টার্মিনাল', category: 'stand', categoryLabel: 'বাস মোড়', lat: 24.4390, lng: 90.5480 },
  { name: 'গফরগাঁও রেলওয়ে স্টেশন', category: 'station', categoryLabel: 'রেলওয়ে', lat: 24.4325, lng: 90.5535 },
  { name: 'উপজেলা স্বাস্থ্য কমপ্লেক্স (হাসপাতাল)', category: 'hospital', categoryLabel: 'জরুরি সেবা', lat: 24.4362, lng: 90.5470 },
  { name: 'শিবগঞ্জ বাজার খেয়াঘাট', category: 'market', categoryLabel: 'নদীঘাট', lat: 24.4480, lng: 90.5360 },
  { name: 'কান্দিপাড়া বাজার মোড়', category: 'market', categoryLabel: 'কমিউনিটি মোড়', lat: 24.4010, lng: 90.5120 },
  { name: 'পাঁচবাগ বাজার স্ট্যান্ড', category: 'stand', categoryLabel: 'ইউনিয়ন মোড়', lat: 24.3750, lng: 90.6120 },
  { name: 'সালটিয়া ইউনিয়ন পরিষদ', category: 'admin', categoryLabel: 'প্রশাসনিক', lat: 24.4420, lng: 90.5590 },
  { name: 'মশাখালী রেলওয়ে স্টেশন বাজার', category: 'station', categoryLabel: 'রেলওয়ে', lat: 24.3760, lng: 90.5280 },
  { name: 'উথুরী হাই স্কুল সংলগ্ন মোড়', category: 'stand', categoryLabel: 'স্কুল মোড়', lat: 24.4210, lng: 90.5620 },
  { name: 'রসুলপুর বাজার চৌরাস্তা', category: 'market', categoryLabel: 'চৌরাস্তা', lat: 24.4600, lng: 90.5400 }
];

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  isPickup,
  value,
  isGpsActive = false,
  userGps,
  onLocateGps,
  onChangeLocation,
  placeholder = 'স্থান খুঁজুন বা বাছুন...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredPlaces = GAFARGAON_POPULAR_PLACES.filter((p) => {
    if (!inputValue.trim()) return true;
    const q = inputValue.toLowerCase().trim();
    return p.name.toLowerCase().includes(q) || p.categoryLabel.toLowerCase().includes(q);
  });

  const handleSelectPlace = (place: PlaceItem) => {
    setInputValue(place.name);
    onChangeLocation(place.name, { lat: place.lat, lng: place.lng });
    setIsOpen(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    onChangeLocation(text);
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
          <MapPin className={`w-3.5 h-3.5 ${isPickup ? 'text-emerald-600' : 'text-red-500'}`} />
          <span>{label}</span>
        </label>
        {isPickup && onLocateGps && (
          <button
            type="button"
            onClick={onLocateGps}
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
              isGpsActive
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
            title="লাইভ GPS লোকেশন চিহ্নিত করুন"
          >
            <Navigation className={`w-3 h-3 ${isGpsActive ? 'text-emerald-600 animate-pulse' : ''}`} />
            <span>{isGpsActive ? 'GPS সক্রিয়' : 'আমার লোকেশন নিন'}</span>
          </button>
        )}
      </div>

      <div className="relative flex items-center bg-white border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-xl px-2.5 py-1.5 transition-all shadow-xs">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1.5" />
        <input
          type="text"
          value={inputValue}
          onChange={handleTextChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full text-xs font-semibold text-slate-800 placeholder-slate-400 bg-transparent outline-none truncate"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              onChangeLocation('');
            }}
            className="text-slate-400 hover:text-slate-600 p-1 shrink-0 ml-1 rounded-full hover:bg-slate-100"
            title="মুছুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto z-50 p-1.5 divide-y divide-slate-50 animate-in fade-in zoom-in-95">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>গফরগাঁও ও পাগলা এলাকার জনপ্রিয় স্থানসমূহ</span>
            <span className="text-emerald-600 font-medium">{filteredPlaces.length} টি স্থান</span>
          </div>
          {filteredPlaces.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500">
              কোনো তালিকাভুক্ত স্থান পাওয়া যায়নি। আপনি নিজের মতো টাইপ করতে পারেন।
            </div>
          ) : (
            filteredPlaces.map((place) => {
              const isSelected = inputValue.trim() === place.name;
              return (
                <button
                  key={place.name}
                  type="button"
                  onClick={() => handleSelectPlace(place)}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isPickup ? 'text-emerald-600' : 'text-red-500'}`} />
                    <span className="truncate">{place.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {place.categoryLabel}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
