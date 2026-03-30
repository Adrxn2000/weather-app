import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const getWeatherTheme = (code) => {
  if (code === 0) return { bg: "from-amber-400 via-orange-300 to-sky-400", accent: "#f59e0b", name: "clear" };
  if (code >= 1 && code <= 3) return { bg: "from-slate-500 via-blue-400 to-sky-300", accent: "#94a3b8", name: "cloudy" };
  if (code >= 45 && code <= 48) return { bg: "from-gray-600 via-gray-500 to-gray-400", accent: "#9ca3af", name: "fog" };
  if (code >= 51 && code <= 67) return { bg: "from-slate-700 via-blue-700 to-blue-500", accent: "#60a5fa", name: "rain" };
  if (code >= 71 && code <= 86) return { bg: "from-slate-300 via-blue-200 to-white", accent: "#bfdbfe", name: "snow" };
  if (code >= 95 && code <= 99) return { bg: "from-gray-900 via-purple-900 to-slate-800", accent: "#a78bfa", name: "thunder" };
  return { bg: "from-sky-600 via-blue-500 to-indigo-400", accent: "#38bdf8", name: "default" };
};

const getWeatherLabel = (code) => {
  if (code === 0) return "Clear Sky";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Light Drizzle";
  if (code >= 61 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 86) return "Snowy";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
};

const WeatherIcon = ({ code, size = 64 }) => {
  const s = size;
  if (code === 0) return (
    <motion.svg width={s} height={s} viewBox="0 0 64 64" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
      <circle cx="32" cy="32" r="12" fill="#fbbf24" />
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <motion.line key={i} x1="32" y1="32"
          x2={32 + 22 * Math.cos((angle * Math.PI) / 180)}
          y2={32 + 22 * Math.sin((angle * Math.PI) / 180)}
          stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }} />
      ))}
    </motion.svg>
  );
  if (code >= 51 && code <= 67) return (
    <svg width={s} height={s} viewBox="0 0 64 64">
      <motion.path d="M48,28c0-8.8-7.2-16-16-16S16,19.2,16,28c-6.6,0-12,5.4-12,12s5.4,12,12,12h32c6.6,0,12-5.4,12-12S54.6,28,48,28z" fill="rgba(148,163,184,0.9)"
        animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }} />
      {[20, 32, 44].map((x, i) => (
        <motion.line key={i} x1={x} y1="54" x2={x - 4} y2="62" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"
          animate={{ y: [0, 4, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }} />
      ))}
    </svg>
  );
  if (code >= 95) return (
    <svg width={s} height={s} viewBox="0 0 64 64">
      <motion.path d="M48,20c0-8.8-7.2-16-16-16S16,11.2,16,20c-6.6,0-12,5.4-12,12s5.4,12,12,12h32c6.6,0,12-5.4,12-12S54.6,20,48,20z" fill="rgba(71,85,105,0.9)"
        animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.path d="M36,28l-8,12h6l-4,10 10-14h-6l6-8z" fill="#fde047"
        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.1, 0.8] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: 0.5 }} />
    </svg>
  );
  if (code >= 71 && code <= 86) return (
    <svg width={s} height={s} viewBox="0 0 64 64">
      <motion.path d="M48,22c0-8.8-7.2-16-16-16S16,13.2,16,22c-6.6,0-12,5.4-12,12s5.4,12,12,12h32c6.6,0,12-5.4,12-12S54.6,22,48,22z" fill="rgba(186,230,253,0.9)"
        animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }} />
      {[18, 28, 38, 48].map((x, i) => (
        <motion.circle key={i} cx={x} cy={54} r="2.5" fill="white"
          animate={{ y: [0, 6, 12], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }} />
      ))}
    </svg>
  );
  return (
    <svg width={s} height={s} viewBox="0 0 64 64">
      <motion.circle cx="24" cy="28" r="10" fill="#fbbf24" animate={{ x: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.path d="M50,34c0-7.7-6.3-14-14-14c-1.5,0-2.9,0.2-4.3,0.6C30.1,17.5,26.1,15,21.5,15C14,15,8,21,8,28.5C8,36,14,42,21.5,42H50c5.5,0,10-4.5,10-10S55.5,34,50,34z" fill="rgba(148,163,184,0.95)"
        animate={{ y: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity }} />
    </svg>
  );
};

const WeatherParticles = ({ weatherName }) => {
  const particles = Array(20).fill(null);
  if (weatherName === "rain") return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div key={i} className="absolute w-0.5 rounded-full bg-blue-300 opacity-60"
          style={{ left: `${Math.random() * 100}%`, height: `${10 + Math.random() * 20}px` }}
          animate={{ y: ["0vh", "100vh"], opacity: [0, 0.7, 0] }}
          transition={{ duration: 0.8 + Math.random() * 0.5, repeat: Infinity, delay: Math.random() * 2, ease: "linear" }} />
      ))}
    </div>
  );
  if (weatherName === "snow") return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-white opacity-70"
          style={{ left: `${Math.random() * 100}%` }}
          animate={{ y: ["0vh", "100vh"], x: [0, Math.random() * 40 - 20], opacity: [0, 0.8, 0] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3, ease: "linear" }} />
      ))}
    </div>
  );
  if (weatherName === "clear") return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array(6).fill(null).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full bg-yellow-200 opacity-20"
          style={{ width: `${60 + i * 40}px`, height: `${60 + i * 40}px`, top: "5%", left: "5%" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }} />
      ))}
    </div>
  );
  return null;
};

const GlassCard = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl ${className}`}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [unit, setUnit] = useState("C");
  const [mapInitialized, setMapInitialized] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [theme, setTheme] = useState({ bg: "from-sky-600 via-blue-500 to-indigo-400", accent: "#38bdf8", name: "default" });

  const convertTemp = (temp) => unit === "F" ? Math.round((temp * 9) / 5 + 32) : Math.round(temp);

  const getMockWeatherData = () => {
    const now = new Date();
    return {
      hourly: {
        time: Array(24).fill().map((_, i) => { const t = new Date(now); t.setHours(t.getHours() + i); return t.toISOString(); }),
        temperature_2m: Array(24).fill().map(() => Math.round(15 + Math.random() * 10)),
        apparent_temperature: Array(24).fill().map(() => Math.round(13 + Math.random() * 10)),
        relativehumidity_2m: Array(24).fill().map(() => Math.round(40 + Math.random() * 40)),
        precipitation_probability: Array(24).fill().map(() => Math.round(Math.random() * 70)),
        weathercode: Array(24).fill().map(() => [0, 1, 2, 61][Math.floor(Math.random() * 4)]),
        windspeed_10m: Array(24).fill().map(() => Math.round(5 + Math.random() * 15)),
        visibility: Array(24).fill().map(() => Math.round(5000 + Math.random() * 15000)),
        uv_index: Array(24).fill().map(() => Math.round(Math.random() * 10)),
      },
      daily: {
        time: Array(7).fill().map((_, i) => { const t = new Date(now); t.setDate(t.getDate() + i); return t.toISOString(); }),
        weathercode: Array(7).fill().map(() => [0, 1, 2, 61][Math.floor(Math.random() * 4)]),
        temperature_2m_min: Array(7).fill().map(() => Math.round(10 + Math.random() * 8)),
        temperature_2m_max: Array(7).fill().map(() => Math.round(18 + Math.random() * 10)),
        sunrise: Array(7).fill().map(() => { const t = new Date(now); t.setHours(6, 30); return t.toISOString(); }),
        sunset: Array(7).fill().map(() => { const t = new Date(now); t.setHours(18, 30); return t.toISOString(); }),
      }
    };
  };

  const geocodeCity = async (cityName) => {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
      const data = await res.json();
      if (!data.results?.length) throw new Error("City not found");
      return { lat: data.results[0].latitude, lon: data.results[0].longitude, name: data.results[0].name, country: data.results[0].country };
    } catch {
      return { lat: 40.7128, lon: -74.006, name: cityName, country: "Demo" };
    }
  };

  const fetchWeatherData = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,relativehumidity_2m,precipitation_probability,weathercode,windspeed_10m,visibility,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=7`
      );
      if (!res.ok) throw new Error("Failed");
      return await res.json();
    } catch {
      return getMockWeatherData();
    }
  };

  const initializeMap = useCallback(() => {
    if (typeof window !== "undefined" && !window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
      script.onload = createMap;
      document.body.appendChild(script);
    } else if (window.L) createMap();
  }, []);

  const createMap = useCallback(() => {
    if (!mapInitialized && typeof window !== "undefined" && window.L && document.getElementById("weatherMap")) {
      const lat = coordinates.lat || 40.7128;
      const lon = coordinates.lon || -74.006;
      const m = window.L.map("weatherMap").setView([lat, lon], 10);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(m);
      const mk = window.L.marker([lat, lon]).addTo(m);
      setMap(m); setMarker(mk); setMapInitialized(true);
    }
  }, [coordinates.lat, coordinates.lon, mapInitialized]);

  useEffect(() => {
    if (map && marker && coordinates.lat && coordinates.lon) {
      const ll = [coordinates.lat, coordinates.lon];
      map.setView(ll, 10);
      marker.setLatLng(ll);
      if (weather) marker.bindPopup(`<b>${coordinates.displayName}</b><br>${convertTemp(weather.hourly.temperature_2m[0])}°${unit}`).openPopup();
    }
  }, [coordinates, map, marker, weather]);

  useEffect(() => {
    if (!mapInitialized) { const t = setTimeout(initializeMap, 500); return () => clearTimeout(t); }
  }, [initializeMap, mapInitialized]);

  useEffect(() => {
    if (weather) setTheme(getWeatherTheme(weather.hourly.weathercode[0]));
  }, [weather]);

  const handleSearch = async () => {
    if (!location.trim()) { setError("Please enter a city"); return; }
    setLoading(true); setError(null);
    try {
      const geo = await geocodeCity(location);
      setCoordinates({ lat: geo.lat, lon: geo.lon, displayName: `${geo.name}, ${geo.country}` });
      const data = await fetchWeatherData(geo.lat, geo.lon);
      setWeather(data);
    } catch {
      setError("Could not load weather. Showing demo data.");
      setCoordinates({ lat: 40.7128, lon: -74.006, displayName: `${location} (Demo)` });
      setWeather(getMockWeatherData());
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (navigator.geolocation) {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 }));
          setCoordinates({ lat: pos.coords.latitude, lon: pos.coords.longitude, displayName: "Current Location" });
          const data = await fetchWeatherData(pos.coords.latitude, pos.coords.longitude);
          setWeather(data);
        } else throw new Error("No geolocation");
      } catch {
        setCoordinates({ lat: -26.2041, lon: 28.0473, displayName: "Johannesburg, ZA" });
        setWeather(getMockWeatherData());
      } finally { setLoading(false); }
    };
    init();
  }, []);

  const currentCode = weather?.hourly?.weathercode?.[0] ?? 0;
  const currentTemp = weather?.hourly?.temperature_2m?.[0] ?? 0;
  const feelsLike = weather?.hourly?.apparent_temperature?.[0] ?? 0;
  const humidity = weather?.hourly?.relativehumidity_2m?.[0] ?? 0;
  const wind = weather?.hourly?.windspeed_10m?.[0] ?? 0;
  const visibility = weather?.hourly?.visibility?.[0] ?? 0;
  const uvIndex = weather?.hourly?.uv_index?.[0] ?? 0;
  const sunrise = weather?.daily?.sunrise?.[0];
  const sunset = weather?.daily?.sunset?.[0];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} relative overflow-hidden transition-all duration-1000`}>
      <WeatherParticles weatherName={theme.name} />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-5xl font-black text-white drop-shadow-lg tracking-tight">SKYE</h1>
          <p className="text-white/70 text-xs tracking-widest uppercase mt-1">Weather Intelligence</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Search any city..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-5 py-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 text-white placeholder-white/50 outline-none focus:bg-white/20 transition-all"
          />
          <button onClick={handleSearch} className="px-6 py-3.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold hover:bg-white/30 transition-all">
            Search
          </button>
          <button onClick={() => setUnit(unit === "C" ? "F" : "C")} className="px-4 py-3.5 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold hover:bg-white/30 transition-all">
            °{unit === "C" ? "F" : "C"}
          </button>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-white text-sm">
            {error}
          </motion.div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <motion.div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
          </div>
        )}

        <AnimatePresence>
          {weather && !loading && (
            <motion.div key="weather" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Hero */}
              <GlassCard className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <WeatherIcon code={currentCode} size={80} />
                    <div>
                      <h2 className="text-white text-2xl font-bold">{coordinates.displayName || "Unknown"}</h2>
                      <p className="text-white/60 text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                      <p className="text-white/80 mt-1 font-medium">{getWeatherLabel(currentCode)}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <motion.p className="text-8xl font-black text-white drop-shadow-lg" key={unit} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      {convertTemp(currentTemp)}°
                    </motion.p>
                    <p className="text-white/60 text-sm">Feels like {convertTemp(feelsLike)}°{unit}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Humidity", value: `${humidity}%`, icon: "💧" },
                  { label: "Wind", value: `${wind} km/h`, icon: "💨" },
                  { label: "Visibility", value: `${(visibility / 1000).toFixed(1)} km`, icon: "👁️" },
                  { label: "UV Index", value: uvIndex <= 2 ? `${uvIndex} Low` : uvIndex <= 5 ? `${uvIndex} Mod` : `${uvIndex} High`, icon: "☀️" },
                ].map((stat, i) => (
                  <GlassCard key={i} className="p-4 text-center">
                    <p className="text-2xl mb-1">{stat.icon}</p>
                    <p className="text-white font-bold text-lg">{stat.value}</p>
                    <p className="text-white/60 text-xs uppercase tracking-wider">{stat.label}</p>
                  </GlassCard>
                ))}
              </div>

              {/* Sunrise / Sunset */}
              {sunrise && sunset && (
                <GlassCard className="p-5">
                  <div className="flex justify-around items-center">
                    <div className="text-center">
                      <p className="text-3xl mb-1">🌅</p>
                      <p className="text-white font-bold">{new Date(sunrise).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="text-white/60 text-xs uppercase tracking-wider">Sunrise</p>
                    </div>
                    <div className="h-12 w-px bg-white/20" />
                    <div className="text-center">
                      <p className="text-3xl mb-1">🌇</p>
                      <p className="text-white font-bold">{new Date(sunset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      <p className="text-white/60 text-xs uppercase tracking-wider">Sunset</p>
                    </div>
                    <div className="h-12 w-px bg-white/20" />
                    <div className="text-center">
                      <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Day Length</p>
                      <p className="text-white font-bold">
                        {Math.round((new Date(sunset) - new Date(sunrise)) / 3600000)}h {Math.round(((new Date(sunset) - new Date(sunrise)) % 3600000) / 60000)}m
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* Hourly */}
              <GlassCard className="p-5">
                <p className="text-white/70 text-xs uppercase tracking-widest mb-4 font-semibold">Today's Forecast</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {weather.hourly.time.slice(0, 24).filter((_, i) => i % 3 === 0).map((time, idx) => {
                    const di = idx * 3;
                    return (
                      <motion.div key={idx} whileHover={{ scale: 1.05 }}
                        className="flex-shrink-0 text-center bg-white/10 hover:bg-white/20 transition-all rounded-xl p-3 w-20 border border-white/10">
                        <p className="text-white/60 text-xs">{new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                        <div className="my-2 flex justify-center"><WeatherIcon code={weather.hourly.weathercode[di]} size={28} /></div>
                        <p className="text-white font-bold text-sm">{convertTemp(weather.hourly.temperature_2m[di])}°</p>
                        <p className="text-blue-200 text-xs">{weather.hourly.precipitation_probability[di]}%</p>
                      </motion.div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* 7-Day */}
              <GlassCard className="p-5">
                <p className="text-white/70 text-xs uppercase tracking-widest mb-4 font-semibold">7-Day Forecast</p>
                <div className="space-y-2">
                  {weather.daily.time.map((date, i) => (
                    <motion.div key={i} whileHover={{ x: 4 }}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/10 transition-all">
                      <span className="text-white/80 w-16 text-sm font-medium">
                        {i === 0 ? "Today" : new Date(date).toLocaleDateString(undefined, { weekday: "short" })}
                      </span>
                      <div className="w-8 flex justify-center"><WeatherIcon code={weather.daily.weathercode[i]} size={24} /></div>
                      <span className="text-white/60 text-xs w-24 text-center">{getWeatherLabel(weather.daily.weathercode[i])}</span>
                      <div className="text-right">
                        <span className="text-white font-bold text-sm">{convertTemp(weather.daily.temperature_2m_max[i])}°</span>
                        <span className="text-white/50 text-sm"> / {convertTemp(weather.daily.temperature_2m_min[i])}°</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              {/* Map */}
              <GlassCard className="overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <p className="text-white/70 text-xs uppercase tracking-widest font-semibold">Location Map</p>
                </div>
                <div id="weatherMap" className="h-64 w-full" />
              </GlassCard>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}