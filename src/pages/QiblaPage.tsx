import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, 
  MapPin, 
  Info, 
  AlertCircle, 
  ShieldCheck, 
  Settings2,
  ChevronRight,
  Compass,
  ArrowRight,
  Zap,
  RotateCw
} from 'lucide-react';
import QiblaCompass from '../components/qibla/QiblaCompass';
import { cn } from '../lib/utils';

export default function QiblaPage() {
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);
  const [bearing, setBearing] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [heading, setHeading] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>('Detecting...');
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [orientationPermission, setOrientationPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detect Location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lon: longitude });
          setPermissionState('granted');
          
          // Calculate Initial Values
          const b = getQiblaBearing(latitude, longitude);
          const d = getDistance(latitude, longitude);
          setBearing(b);
          setDistance(d);

          // Get Location Name
          try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await res.json();
            setLocationName(`${data.city || data.locality}, ${data.countryCode}`);
          } catch (e) {
            setLocationName('Current Location');
          }
        },
        (err) => {
          console.error(err);
          setPermissionState('denied');
          setError('Location access denied. Please enable location to find Qibla.');
        }
      );
    }
  }, []);

  useEffect(() => {
    // Handle Device Orientation
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // @ts-ignore - webkitCompassHeading is iOS specific
      let head = e.webkitCompassHeading || (e.alpha ? 360 - e.alpha : null);
      if (head !== null) {
        setHeading(head);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // iOS 13+ requires manual permission
      setOrientationPermission(false);
    } else {
      setOrientationPermission(true);
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const requestOrientationPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setOrientationPermission(true);
        } else {
          setError('Orientation sensor permission denied.');
        }
      } catch (err) {
        console.error(err);
        setError('Orientation sensor access failed.');
      }
    }
  };

  const getQiblaBearing = (lat1: number, ln1: number) => {
    const lat2 = 21.4225;
    const ln2 = 39.8262;

    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((ln2 - ln1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let θ = Math.atan2(y, x);
    θ = ((θ * 180) / Math.PI + 360) % 360;
    return θ;
  };

  const getDistance = (lat1: number, lon1: number) => {
    const lat2 = 21.4225;
    const lon2 = 39.8262;
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 md:space-y-8 pb-32">
      {/* Header */}
      <div className="text-center space-y-1.5 md:space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-brand-emerald rounded-full border border-emerald-100 dark:border-emerald-900/50">
          <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />
          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Real-time Tracker</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black dark:text-white tracking-tight leading-tight">Qibla Finder</h1>
        <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-medium opacity-80">Point your device to Makkah.</p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm overflow-hidden relative mx-1 md:mx-0">
        <div className="p-6 md:p-8 pb-4 flex flex-col items-center">
          {error ? (
            <div className="flex flex-col items-center text-center p-6 md:p-8 space-y-4 md:space-y-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 dark:bg-red-950/30 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-red-500 animate-bounce">
                <AlertCircle size={32} md:size={40} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold dark:text-white mb-2">Something went wrong</h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 md:px-8 py-2.5 md:py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl md:rounded-2xl font-bold flex items-center gap-2 text-sm md:text-base"
              >
                <RotateCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : !coords ? (
            <div className="flex flex-col items-center p-8 md:p-12 text-center space-y-6 md:space-y-8">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-50 dark:bg-zinc-800 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-brand-emerald">
                  <MapPin size={40} md:size={48} className="animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-zinc-900 rounded-xl md:rounded-2xl shadow-lg border-4 border-emerald-50 dark:border-zinc-800 flex items-center justify-center">
                  <ShieldCheck size={16} md:size={20} className="text-brand-emerald" />
                </div>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold dark:text-white mb-2">Location Required</h2>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-[240px] md:max-w-xs leading-relaxed opacity-80">
                  We need your coordinates to calculate the exact direction to the Kaaba.
                </p>
              </div>
            </div>
          ) : !orientationPermission ? (
            <div className="flex flex-col items-center p-8 md:p-12 text-center space-y-6 md:space-y-8">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-50 dark:bg-indigo-950/30 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-indigo-500">
                <Compass size={40} md:size={48} className="animate-spin-slow" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold dark:text-white mb-2">Sensor Support</h2>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-[240px] md:max-w-xs leading-relaxed opacity-80">
                  To provide a live compass experience, please allow access to motion sensors.
                </p>
              </div>
              <button 
                onClick={requestOrientationPermission}
                className="w-full max-w-[240px] py-3.5 bg-brand-emerald text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 text-sm md:text-base"
              >
                <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
                Grant Access
              </button>
            </div>
          ) : (
            <QiblaCompass 
              qiblaAngle={bearing} 
              userHeading={heading} 
              locationName={locationName} 
            />
          )}
        </div>

        {/* Info Cards Overlay */}
        {coords && orientationPermission && (
          <div className="bg-slate-50 dark:bg-zinc-800/30 p-4 md:p-6 grid grid-cols-2 gap-3 md:gap-4 border-t border-slate-100 dark:border-zinc-800">
            <div className="p-3 md:p-4 bg-white dark:bg-zinc-900 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-zinc-800 flex flex-col items-center text-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg md:rounded-xl flex items-center justify-center text-brand-emerald mb-2 md:mb-3">
                <Navigation className="w-4.5 h-4.5 md:w-5 md:h-5" />
              </div>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Direction</span>
              <span className="text-lg md:text-xl font-bold dark:text-white">{Math.round(bearing)}°</span>
            </div>
            <div className="p-3 md:p-4 bg-white dark:bg-zinc-900 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-zinc-800 flex flex-col items-center text-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 dark:bg-amber-950/30 rounded-lg md:rounded-xl flex items-center justify-center text-brand-gold mb-2 md:mb-3">
                <Zap className="w-4.5 h-4.5 md:w-5 md:h-5" />
              </div>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Distance</span>
              <span className="text-lg md:text-xl font-bold dark:text-white">{distance.toLocaleString()} km</span>
            </div>
          </div>
        )}
      </div>

      {/* Guide Info */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 flex items-start gap-4 shadow-sm mx-1 md:mx-0">
        <div className="p-2.5 bg-brand-emerald/10 text-brand-emerald rounded-xl shrink-0">
          <Info className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="space-y-0.5 md:space-y-1">
          <h4 className="font-bold text-sm md:text-base dark:text-white">Pro Tip</h4>
          <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-snug font-medium opacity-80">
            Keep device flat and away from metal for accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}
