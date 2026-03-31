import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ───────────────────────────────────────────────────────────────────
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

const getAccent = (code) => {
  if (code === 0) return { color: "#f59e0b", glow: "rgba(245,158,11,0.25)", label: "sunny" };
  if (code >= 1 && code <= 3) return { color: "#94a3b8", glow: "rgba(148,163,184,0.2)", label: "cloudy" };
  if (code >= 45 && code <= 48) return { color: "#9ca3af", glow: "rgba(156,163,175,0.2)", label: "fog" };
  if (code >= 51 && code <= 67) return { color: "#60a5fa", glow: "rgba(96,165,250,0.25)", label: "rain" };
  if (code >= 71 && code <= 86) return { color: "#bfdbfe", glow: "rgba(191,219,254,0.2)", label: "snow" };
  if (code >= 95 && code <= 99) return { color: "#a78bfa", glow: "rgba(167,139,250,0.25)", label: "thunder" };
  return { color: "#38bdf8", glow: "rgba(56,189,248,0.2)", label: "default" };
};

const windDirLabel = (deg) => ["N","NE","E","SE","S","SW","W","NW"][Math.round(deg / 45) % 8];
const uvLabel = (v) => v <= 2 ? "Low" : v <= 5 ? "Moderate" : v <= 7 ? "High" : "Very High";
const uvColor = (v) => v <= 2 ? "#22c55e" : v <= 5 ? "#f59e0b" : v <= 7 ? "#f97316" : "#ef4444";

// ─── Animated Weather Icons ────────────────────────────────────────────────────
const WeatherIcon = ({ code, size = 48 }) => {
  if (code === 0) return (
    <motion.svg width={size} height={size} viewBox="0 0 48 48"
      animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
      <circle cx="24" cy="24" r="9" fill="#fbbf24" />
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <motion.line key={i} x1="24" y1="24"
          x2={24 + 17 * Math.cos((a * Math.PI) / 180)}
          y2={24 + 17 * Math.sin((a * Math.PI) / 180)}
          stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }} />
      ))}
    </motion.svg>
  );
  if (code >= 51 && code <= 67) return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <motion.path d="M36,18c0-6.6-5.4-12-12-12S12,11.4,12,18c-5,0-9,4-9,9s4,9,9,9h24c5,0,9-4,9-9S41,18,36,18z"
        fill="#64748b" animate={{ y: [0,-1,0] }} transition={{ duration: 3, repeat: Infinity }} />
      {[14,24,34].map((x, i) => (
        <motion.line key={i} x1={x} y1="38" x2={x-3} y2="46" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"
          animate={{ y: [0,3,0], opacity: [0.3,1,0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }} />
      ))}
    </svg>
  );
  if (code >= 95) return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <motion.path d="M36,16c0-6.6-5.4-12-12-12S12,9.4,12,16c-5,0-9,4-9,9s4,9,9,9h24c5,0,9-4,9-9S41,16,36,16z"
        fill="#475569" animate={{ y: [0,-1,0] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.path d="M28,22l-6,9h4.5l-3,8 7.5-11H27l5-6z" fill="#fde047"
        animate={{ opacity: [0.2,1,0.2] }} transition={{ duration: 0.7, repeat: Infinity }} />
    </svg>
  );
  if (code >= 71 && code <= 86) return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <motion.path d="M36,18c0-6.6-5.4-12-12-12S12,11.4,12,18c-5,0-9,4-9,9s4,9,9,9h24c5,0,9-4,9-9S41,18,36,18z"
        fill="#bfdbfe" animate={{ y: [0,-1,0] }} transition={{ duration: 3, repeat: Infinity }} />
      {[12,20,28,36].map((x, i) => (
        <motion.circle key={i} cx={x} cy={40} r="2" fill="white"
          animate={{ y: [0,5,10], opacity: [0,1,0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.35 }} />
      ))}
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <motion.circle cx="18" cy="20" r="8" fill="#fbbf24" animate={{ x: [-1,1,-1] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.path d="M36,22c0-6.1-5-11-11-11c-1.1,0-2.2,0.2-3.2,0.5C20.1,9,17,7,13.5,7C8,7,3.5,11.5,3.5,17c0,5.5,4.5,10,10,10H36c4.4,0,8-3.6,8-8S40.4,22,36,22z"
        fill="#94a3b8" animate={{ y: [0,-2,0] }} transition={{ duration: 4, repeat: Infinity }} />
    </svg>
  );
};

// ─── Weather Particles ─────────────────────────────────────────────────────────
const WeatherParticles = ({ label }) => {
  if (label === "rain") return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array(18).fill(null).map((_, i) => (
        <motion.div key={i} className="absolute w-px bg-blue-300/40 rounded-full"
          style={{ left: `${Math.random() * 100}%`, height: `${12 + Math.random() * 18}px` }}
          animate={{ y: ["-5vh", "105vh"], opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.7 + Math.random() * 0.4, repeat: Infinity, delay: Math.random() * 2, ease: "linear" }} />
      ))}
    </div>
  );
  if (label === "snow") return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array(16).fill(null).map((_, i) => (
        <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-white/50"
          style={{ left: `${Math.random() * 100}%` }}
          animate={{ y: ["-5vh", "105vh"], x: [0, (Math.random() - 0.5) * 50], opacity: [0, 0.8, 0] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 4, ease: "linear" }} />
      ))}
    </div>
  );
  if (label === "sunny") return (
    <div className="absolute top-0 right-0 w-64 h-64 overflow-hidden pointer-events-none z-0">
      {Array(4).fill(null).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full bg-yellow-300/10"
          style={{ width: `${80 + i * 50}px`, height: `${80 + i * 50}px`, top: "-10%", right: "-10%" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6 }} />
      ))}
    </div>
  );
  return null;
};

// ─── Themes ────────────────────────────────────────────────────────────────────
const dark = {
  bg: "#0f172a", card: "#1e293b", border: "#334155",
  text: "#f1f5f9", subtext: "#94a3b8", input: "#1e293b",
  divider: "#334155",
};
const light = {
  bg: "#f1f5f9", card: "#ffffff", border: "#e2e8f0",
  text: "#0f172a", subtext: "#64748b", input: "#ffffff",
  divider: "#e2e8f0",
};

// ─── Interactive Leaflet Map ───────────────────────────────────────────────────
const InteractiveMap = ({ lat, lon, isDark, onMapClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  // ── Effect 1: Initialize map once on mount ──
  useEffect(() => {
    const initMap = () => {
      if (mapInstanceRef.current) return;
      const el = document.getElementById("leaflet-map");
      if (!el) return;

      const L = window.L;
      const map = L.map("leaflet-map", { zoomControl: true, attributionControl: true })
        .setView([lat, lon], 10);

      const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

      const tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      const marker = L.marker([lat, lon]).addTo(map);
      markerRef.current = marker;
      mapInstanceRef.current = map;

      map.on("click", (e) => {
        const { lat: clickLat, lng: clickLon } = e.latlng;
        onMapClick(clickLat, clickLon);
      });
    };

    if (!window.L) {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
        document.head.appendChild(link);
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // ── Effect 2: Fly to new location when coords change ──
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && lat && lon) {
      mapInstanceRef.current.flyTo([lat, lon], 10, { duration: 1.2 });
      markerRef.current.setLatLng([lat, lon]);
    }
  }, [lat, lon]);

  // ── Effect 3: Swap tile layer when theme changes ──
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    const newTile = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTile;
  }, [isDark]);

  return (
    <div ref={mapRef} className="relative w-full" style={{ height: "280px" }}>
      <div id="leaflet-map" style={{ height: "100%", width: "100%", borderRadius: "0 0 16px 16px" }} />
      <div className="absolute top-2 left-2 z-[1000] bg-black/60 text-white text-xs px-2 py-1 rounded-lg pointer-events-none">
        🖱️ Click map to get weather
      </div>
    </div>
  );
};

//Main Component
export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ lat: -26.2041, lon: 28.0473, displayName: "Johannesburg, ZA" });
  const [unit, setUnit] = useState("C");
  const [isDark, setIsDark] = useState(true);

  const T = isDark ? dark : light;
  const code = weather?.hourly?.weathercode?.[0] ?? 2;
  const accent = getAccent(code);
  const convertTemp = (t) => unit === "F" ? Math.round((t * 9) / 5 + 32) : Math.round(t);

  const getMockData = () => {
    const now = new Date();
    return {
      hourly: {
        time: Array(24).fill().map((_, i) => { const d = new Date(now); d.setHours(d.getHours() + i); return d.toISOString(); }),
        temperature_2m: Array(24).fill().map(() => Math.round(15 + Math.random() * 12)),
        apparent_temperature: Array(24).fill().map(() => Math.round(13 + Math.random() * 12)),
        relativehumidity_2m: Array(24).fill().map(() => Math.round(40 + Math.random() * 40)),
        precipitation_probability: Array(24).fill().map(() => Math.round(Math.random() * 60)),
        weathercode: Array(24).fill(2),
        windspeed_10m: Array(24).fill().map(() => Math.round(5 + Math.random() * 15)),
        winddirection_10m: Array(24).fill().map(() => Math.round(Math.random() * 360)),
        visibility: Array(24).fill().map(() => Math.round(8000 + Math.random() * 12000)),
        uv_index: Array(24).fill().map(() => Math.round(Math.random() * 8)),
        surface_pressure: Array(24).fill().map(() => Math.round(1010 + Math.random() * 20)),
      },
      daily: {
        time: Array(7).fill().map((_, i) => { const d = new Date(now); d.setDate(d.getDate() + i); return d.toISOString(); }),
        weathercode: Array(7).fill().map(() => [0,1,2,3,61][Math.floor(Math.random() * 5)]),
        temperature_2m_min: Array(7).fill().map(() => Math.round(10 + Math.random() * 8)),
        temperature_2m_max: Array(7).fill().map(() => Math.round(20 + Math.random() * 10)),
        sunrise: Array(7).fill().map(() => { const d = new Date(now); d.setHours(6, 22); return d.toISOString(); }),
        sunset: Array(7).fill().map(() => { const d = new Date(now); d.setHours(18, 15); return d.toISOString(); }),
        precipitation_sum: Array(7).fill().map(() => +(Math.random() * 5).toFixed(1)),
      }
    };
  };

  const geocodeCity = async (name) => {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
      const data = await res.json();
      if (!data.results?.length) throw new Error("Not found");
      return { lat: data.results[0].latitude, lon: data.results[0].longitude, displayName: `${data.results[0].name}, ${data.results[0].country}` };
    } catch { return null; }
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown";
      const country = data.address?.country || "";
      return `${city}, ${country}`;
    } catch { return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`; }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=precipitation,temperature_2m,wind_speed_10m,wind_direction_10m,rain,showers,snowfall,surface_pressure,pressure_msl,cloud_cover,relative_humidity_2m,apparent_temperature,weather_code,visibility` +
        `&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,visibility,uv_index,surface_pressure` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,daily=uv_index_max,wind_speed_10m_max` +
        `&timezone=GMT&forecast_days=7`
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (data.hourly) {
        data.hourly.weathercode = data.hourly.weather_code;
        data.hourly.windspeed_10m = data.hourly.wind_speed_10m;
        data.hourly.winddirection_10m = data.hourly.wind_direction_10m;
        data.hourly.relativehumidity_2m = data.hourly.relative_humidity_2m;
      }
      if (data.daily) {
        data.daily.weathercode = data.daily.weather_code;
      }
      return data;
    } catch { return getMockData(); }
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setLoading(true); setError(null);
    const geo = await geocodeCity(searchInput);
    if (!geo) { setError("City not found."); setLoading(false); return; }
    setCoords(geo);
    const data = await fetchWeather(geo.lat, geo.lon);
    setWeather(data);
    setLoading(false);
  };

  const handleMapClick = async (lat, lon) => {
    setMapLoading(true);
    const name = await reverseGeocode(lat, lon);
    setCoords({ lat, lon, displayName: name });
    const data = await fetchWeather(lat, lon);
    setWeather(data);
    setMapLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (navigator.geolocation) {
          const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 }));
          const name = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, displayName: name });
          const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
          setWeather(data);
        } else throw new Error("no geo");
      } catch {
        const data = await fetchWeather(-26.2041, 28.0473);
        setWeather(data);
      } finally { setLoading(false); }
    };
    init();
  }, []);

  const temp = weather?.hourly?.temperature_2m?.[0] ?? 22;
  const feels = weather?.hourly?.apparent_temperature?.[0] ?? 20;
  const humidity = weather?.hourly?.relativehumidity_2m?.[0] ?? 65;
  const wind = weather?.hourly?.windspeed_10m?.[0] ?? 7;
  const windDir = weather?.hourly?.winddirection_10m?.[0] ?? 90;
  const vis = weather?.hourly?.visibility?.[0] ?? 10000;
  const uv = weather?.hourly?.uv_index?.[0] ?? 3;
  const pressure = weather?.hourly?.surface_pressure?.[0] ?? 1013;
  const precip = weather?.hourly?.precipitation_probability?.[0] ?? 0;
  const sunrise = weather?.daily?.sunrise?.[0];
  const sunset = weather?.daily?.sunset?.[0];
  const dayLen = sunrise && sunset ? Math.round((new Date(sunset) - new Date(sunrise)) / 3600000) : 12;

  return (
    <div className="min-h-screen relative transition-colors duration-500"
      style={{ backgroundColor: T.bg, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <WeatherParticles label={accent.label} />

      <div className="absolute top-0 right-0 w-96 h-48 rounded-full blur-3xl pointer-events-none opacity-20 transition-all duration-1000"
        style={{ backgroundColor: accent.color }} />

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <motion.div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg"
              style={{ backgroundColor: accent.color }}
              animate={{ boxShadow: [`0 0 8px ${accent.glow}`, `0 0 18px ${accent.glow}`, `0 0 8px ${accent.glow}`] }}
              transition={{ duration: 2, repeat: Infinity }}>
              S
            </motion.div>
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: T.text }}>SKYE</h1>
              <p className="text-xs -mt-0.5" style={{ color: T.subtext }}>Weather Intelligence</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsDark(!isDark)}
              className="w-10 h-10 rounded-xl border flex items-center justify-center text-lg hover:opacity-80 transition-all"
              style={{ backgroundColor: T.card, borderColor: T.border }}>
              {isDark ? "🌙" : "☀️"}
            </button>
            <button onClick={() => setUnit(unit === "C" ? "F" : "C")}
              className="px-3 h-10 rounded-xl border text-sm font-bold hover:opacity-80 transition-all"
              style={{ backgroundColor: T.card, borderColor: T.border, color: T.text }}>
              °{unit === "C" ? "F" : "C"}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-5">
          <input
            type="text"
            placeholder="Search for a city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all"
            style={{ backgroundColor: T.input, borderColor: searchInput ? accent.color : T.border, color: T.text }}
          />
          <button onClick={handleSearch}
            className="px-5 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: accent.color }}>
            Search
          </button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-4 px-4 py-2.5 rounded-xl text-sm"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </motion.div>
        )}

        {(loading || mapLoading) && (
          <div className="flex items-center justify-center gap-3 py-6">
            <motion.div className="w-6 h-6 rounded-full border-2"
              style={{ borderColor: "transparent", borderTopColor: accent.color }}
              animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
            <p className="text-sm" style={{ color: T.subtext }}>
              {mapLoading ? "Loading weather for selected location..." : "Fetching weather..."}
            </p>
          </div>
        )}

        <AnimatePresence>
          {weather && !loading && (
            <motion.div key="content" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

              {/* Row 1: Current Weather + Map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Current Weather */}
                <div className="rounded-2xl border p-5" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: T.subtext }}>Current Weather</p>
                      <h2 className="text-lg font-bold" style={{ color: T.text }}>{coords.displayName}</h2>
                      <p className="text-xs" style={{ color: T.subtext }}>
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <WeatherIcon code={code} size={52} />
                  </div>

                  <div className="flex items-end gap-3 mb-4">
                    <motion.p className="text-7xl font-black leading-none" style={{ color: T.text }}
                      key={`${temp}-${unit}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      {convertTemp(temp)}°<span className="text-2xl font-medium" style={{ color: accent.color }}>{unit}</span>
                    </motion.p>
                    <div className="pb-2">
                      <p className="text-sm font-semibold" style={{ color: T.text }}>{getWeatherLabel(code)}</p>
                      <p className="text-xs" style={{ color: T.subtext }}>Feels like {convertTemp(feels)}°{unit}</p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: accent.color }}>
                        H:{convertTemp(weather.daily.temperature_2m_max[0])}° · L:{convertTemp(weather.daily.temperature_2m_min[0])}°
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t grid grid-cols-2 gap-2" style={{ borderColor: T.border }}>
                    {[
                      { icon: "💨", label: "Wind", value: `${wind} km/h ${windDirLabel(windDir)}` },
                      { icon: "💧", label: "Humidity", value: `${humidity}%` },
                      { icon: "👁️", label: "Visibility", value: `${(vis / 1000).toFixed(0)} km` },
                      { icon: "🌡️", label: "Pressure", value: `${pressure} mb` },
                      { icon: "🌧️", label: "Precip chance", value: `${precip}%` },
                      { icon: "☀️", label: "UV Index", value: `${uv} · ${uvLabel(uv)}` },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-base">{s.icon}</span>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: T.text }}>{s.value}</p>
                          <p className="text-xs" style={{ color: T.subtext }}>{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Map */}
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.subtext }}>Interactive Map</p>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: T.bg, color: T.subtext }}>
                      Click anywhere for weather
                    </span>
                  </div>
                  <InteractiveMap lat={coords.lat} lon={coords.lon} isDark={isDark} onMapClick={handleMapClick} />
                </div>
              </div>

              {/* Row 2: Detail Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border p-4" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: T.subtext }}>Sunrise</p>
                  <p className="text-2xl mb-1">🌅</p>
                  <p className="text-lg font-bold" style={{ color: T.text }}>
                    {sunrise ? new Date(sunrise).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
                  </p>
                  <p className="text-xs" style={{ color: T.subtext }}>Day starts</p>
                </div>
                <div className="rounded-2xl border p-4" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: T.subtext }}>Sunset</p>
                  <p className="text-2xl mb-1">🌇</p>
                  <p className="text-lg font-bold" style={{ color: T.text }}>
                    {sunset ? new Date(sunset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
                  </p>
                  <p className="text-xs" style={{ color: T.subtext }}>{dayLen}h day length</p>
                </div>
                <div className="rounded-2xl border p-4" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: T.subtext }}>UV Index</p>
                  <p className="text-3xl font-black mb-1" style={{ color: T.text }}>{uv}</p>
                  <p className="text-sm font-semibold mb-2" style={{ color: uvColor(uv) }}>{uvLabel(uv)}</p>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: T.border }}>
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: uvColor(uv) }}
                      initial={{ width: 0 }} animate={{ width: `${(uv / 12) * 100}%` }} transition={{ duration: 1 }} />
                  </div>
                </div>
                <div className="rounded-2xl border p-4" style={{ backgroundColor: T.card, borderColor: T.border }}>
                  <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: T.subtext }}>Wind</p>
                  <div className="flex items-center gap-3">
                    <motion.div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-base"
                      style={{ borderColor: accent.color, color: accent.color }}
                      animate={{ rotate: windDir }} transition={{ duration: 1.5, ease: "easeInOut" }}>↑
                    </motion.div>
                    <div>
                      <p className="text-xl font-black" style={{ color: T.text }}>{wind}</p>
                      <p className="text-xs" style={{ color: T.subtext }}>km/h {windDirLabel(windDir)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Hourly Forecast */}
              <div className="rounded-2xl border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.subtext }}>Hourly Forecast</p>
                  <p className="text-xs" style={{ color: T.subtext }}>Next 24 hours</p>
                </div>
                <div className="flex gap-2 overflow-x-auto p-4 pb-3">
                  {weather.hourly.time.slice(0, 24).filter((_, i) => i % 2 === 0).map((time, idx) => {
                    const di = idx * 2;
                    const isNow = idx === 0;
                    return (
                      <motion.div key={idx} whileHover={{ y: -2 }}
                        className="flex-shrink-0 text-center rounded-xl p-3 w-16 border transition-all cursor-default"
                        style={isNow
                          ? { backgroundColor: accent.color, borderColor: accent.color }
                          : { backgroundColor: "transparent", borderColor: T.border }}>
                        <p className="text-xs font-medium" style={{ color: isNow ? "rgba(255,255,255,0.8)" : T.subtext }}>
                          {isNow ? "Now" : new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <div className="my-1.5 flex justify-center">
                          <WeatherIcon code={weather.hourly.weathercode[di]} size={22} />
                        </div>
                        <p className="text-sm font-bold" style={{ color: isNow ? "white" : T.text }}>
                          {convertTemp(weather.hourly.temperature_2m[di])}°
                        </p>
                        <p className="text-xs" style={{ color: isNow ? "rgba(255,255,255,0.7)" : T.subtext }}>
                          {weather.hourly.precipitation_probability[di]}%
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Row 4: 7-Day Forecast */}
              <div className="rounded-2xl border" style={{ backgroundColor: T.card, borderColor: T.border }}>
                <div className="px-5 py-3 border-b" style={{ borderColor: T.border }}>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: T.subtext }}>7-Day Forecast</p>
                </div>
                <div>
                  {weather.daily.time.map((date, i) => {
                    const maxT = convertTemp(weather.daily.temperature_2m_max[i]);
                    const minT = convertTemp(weather.daily.temperature_2m_min[i]);
                    const allMax = weather.daily.temperature_2m_max.map(convertTemp);
                    const allMin = weather.daily.temperature_2m_min.map(convertTemp);
                    const rMin = Math.min(...allMin), rMax = Math.max(...allMax);
                    const barLeft = rMax === rMin ? 0 : ((minT - rMin) / (rMax - rMin)) * 100;
                    const barWidth = rMax === rMin ? 100 : ((maxT - minT) / (rMax - rMin)) * 100;
                    return (
                      <motion.div key={i}
                        whileHover={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
                        className="flex items-center gap-4 px-5 py-3 border-b last:border-b-0 transition-all"
                        style={{ borderColor: T.divider }}>
                        <span className="text-sm font-medium w-12" style={{ color: T.text }}>
                          {i === 0 ? "Today" : new Date(date).toLocaleDateString(undefined, { weekday: "short" })}
                        </span>
                        <div className="w-7 flex justify-center">
                          <WeatherIcon code={weather.daily.weathercode[i]} size={22} />
                        </div>
                        <span className="text-xs w-24 hidden md:block" style={{ color: T.subtext }}>
                          {getWeatherLabel(weather.daily.weathercode[i])}
                        </span>
                        <span className="text-xs w-10 text-right" style={{ color: T.subtext }}>{minT}°</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden relative" style={{ backgroundColor: T.border }}>
                          <motion.div className="h-full rounded-full absolute top-0"
                            style={{ backgroundColor: accent.color, left: `${barLeft}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }} />
                        </div>
                        <span className="text-sm font-bold w-10 text-right" style={{ color: T.text }}>{maxT}°</span>
                        <span className="text-xs w-14 text-right hidden md:block" style={{ color: T.subtext }}>
                          {weather.daily.precipitation_sum[i]}cm 💧
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}