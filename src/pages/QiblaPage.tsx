import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Navigation, Info, Loader2, MapPin } from 'lucide-react';
import { cn } from '../lib/utils';

export default function QiblaPage() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [qibla, setQibla] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Kaaba coordinates
  const KAABA_LAT = 21.422487;
  const KAABA_LON = 39.826206;

  const calculateQibla = (lat: number, lon: number) => {
    const φ1 = lat * (Math.PI / 180);
    const φ2 = KAABA_LAT * (Math.PI / 180);
    const ΔL = (KAABA_LON - lon) * (Math.PI / 180);

    const y = Math.sin(ΔL);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(ΔL);
    let result = Math.atan2(y, x) * (180 / Math.PI);
    return (result + 360) % 360;
  };

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setQibla(calculateQibla(latitude, longitude));
        setLoading(false);
      },
      (err) => {
        setError("Please enable location access to find the Qibla direction.");
        setLoading(false);
        console.error(err);
      },
      { enableHighAccuracy: true }
    );

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // heading is the compass direction
      // @ts-ignore - webkitCompassHeading is non-standard but available on iOS
      const h = e.webkitCompassHeading || (e.alpha ? 360 - e.alpha : null);
      if (h !== null) {
        setHeading(h);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    // Request permission for orientation on iOS
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        })
        .catch(console.error);
    }

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const diff = qibla !== null && heading !== null ? (qibla - heading + 540) % 360 - 180 : 0;
  const isAligned = Math.abs(diff) < 5;

  return (
    <div className="max-w-md mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold dark:text-white">Qibla Finder</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Find the direction to the Kaaba</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-brand-emerald animate-spin" />
          <p className="text-slate-500 font-medium">Determining your location...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-6 rounded-3xl text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <Info className="w-6 h-6" />
          </div>
          <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Compass Visualization */}
          <div className="relative aspect-square flex items-center justify-center">
            {/* Outer Circle */}
            <div className="absolute inset-0 border-4 border-slate-200 dark:border-zinc-800 rounded-full" />
            
            {/* Compass Base */}
            <motion.div 
              animate={{ rotate: heading !== null ? -heading : 0 }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
              className="relative w-full h-full p-8"
            >
              {/* Compass Marks */}
              {[0, 90, 180, 270].map((deg) => (
                <div 
                  key={deg}
                  className="absolute inset-0 flex flex-col items-center p-2"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <span className="text-[10px] font-bold text-slate-400">
                    {deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : 'W'}
                  </span>
                  <div className="w-0.5 h-2 bg-slate-300 dark:bg-zinc-700 rounded-full mt-1" />
                </div>
              ))}

              {/* Kaaba Direction Arrow */}
              {qibla !== null && (
                <div 
                  className="absolute inset-0 flex flex-col items-center"
                  style={{ transform: `rotate(${qibla}deg)` }}
                >
                  <motion.div 
                    animate={{ 
                      scale: isAligned ? 1.2 : 1,
                      color: isAligned ? '#10b981' : '#f59e0b'
                    }}
                    className="mt-12"
                  >
                    <Navigation className="w-10 h-10 fill-current" />
                  </motion.div>
                </div>
              )}
            </motion.div>

            {/* Center Hub */}
            <div className="absolute w-4 h-4 bg-white dark:bg-zinc-900 border-2 border-brand-emerald rounded-full z-10" />

            {/* Alignment Badge */}
            {heading !== null && (
              <motion.div 
                animate={{ 
                  scale: isAligned ? 1.1 : 1,
                  backgroundColor: isAligned ? '#10b981' : '#f1f5f9'
                }}
                className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-xs font-bold shadow-lg transition-colors",
                  isAligned ? "text-white" : "text-slate-500 dark:bg-zinc-800 dark:text-slate-400"
                )}
              >
                {isAligned ? 'ALIGNED WITH QIBLA' : 'ROTATE DEVICE'}
              </motion.div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Qibla Angle</p>
              <p className="text-xl font-bold dark:text-white">{qibla?.toFixed(1)}°</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Your Heading</p>
              <p className="text-xl font-bold dark:text-white">{heading !== null ? heading.toFixed(1) + '°' : 'N/A'}</p>
            </div>
          </div>

          <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 flex gap-4">
            <div className="w-10 h-10 bg-brand-emerald/10 text-brand-emerald rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-brand-emerald">Location Detection</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Hold your device flat and move away from electronic devices for best accuracy. 
                Your coordinates: {coords?.latitude.toFixed(4)}, {coords?.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
