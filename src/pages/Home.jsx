import { useEffect, useState } from "react";
import axios from "axios";

// ... (Your SunnyIcon, CloudyIcon, RainIcon, WindIcon, HumidityIcon, PrecipitationIcon remain unchanged)

export default function WeatherDashboard() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });

  const getWeatherIcon = (code) => {
    if (code === 0) return <SunnyIcon />;
    if (code >= 1 && code <= 3) return <CloudyIcon />;
    if (code === 61) return <RainIcon />;
    return <WindIcon />;
  };

  // Auto-detect location on load
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoordinates({ lat: latitude, lon: longitude });

        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const city =
            res.data.address.city ||
            res.data.address.town ||
            res.data.address.village ||
            "Your Location";
          setLocation(city);
          fetchWeather(latitude, longitude, city); // auto fetch weather
        } catch (err) {
          console.error("Reverse geocoding failed", err);
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
        // fallback coordinates for New York
        const lat = 40.7128;
        const lon = -74.006;
        setCoordinates({ lat, lon });
        setLocation("New York");
        fetchWeather(lat, lon, "New York");
      }
    );
  }, []);

  const fetchWeather = async (latParam, lonParam, name = null) => {
    setLoading(true);
    try {
      let lat = latParam;
      let lon = lonParam;

      if (!lat || !lon) {
        // Get coords from search input
        const geoRes = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
        );
        if (geoRes.data.length === 0) {
          alert("Location not found.");
          setLoading(false);
          return;
        }
        lat = geoRes.data[0].lat;
        lon = geoRes.data[0].lon;
        setCoordinates({ lat, lon });
        if (!name) setLocation(geoRes.data[0].display_name);
      }

      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      );
      setWeather(weatherRes.data);
    } catch (err) {
      console.error("Error fetching weather data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-800 text-center mb-8">
          🌤️ Weather Dashboard
        </h1>

        {/* Search Input */}
        <div className="flex flex-col md:flex-row gap-2 mb-8">
          <input
            type="text"
            placeholder="Search city"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 p-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => fetchWeather()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200"
          >
            Search
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {weather && (
          <div className="space-y-8">
            {/* Current Weather */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <h3 className="text-lg font-semibold">Current Weather</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    {getWeatherIcon(weather.hourly.weathercode[0])}
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">{location || "Location"}</h2>
                      <p className="text-gray-600">
                        {new Date(weather.hourly.time[0]).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-5xl font-bold text-blue-800">
                      {weather.hourly.temperature_2m[0]}°C
                    </p>
                    <p className="text-gray-600">
                      Feels like {weather.hourly.temperature_2m[0] - 1}°C
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8 text-center">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <HumidityIcon />
                    <p className="text-gray-600 mt-1">Humidity</p>
                    <p className="font-semibold">
                      {weather.hourly.relative_humidity_2m[0]}%
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <WindIcon />
                    <p className="text-gray-600 mt-1">Wind</p>
                    <p className="font-semibold">
                      {weather.hourly.wind_speed_10m[0]} km/h
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <PrecipitationIcon />
                    <p className="text-gray-600 mt-1">Precipitation</p>
                    <p className="font-semibold">
                      {weather.hourly.precipitation_probability[0]}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <h3 className="text-lg font-semibold">Today's Forecast</h3>
              </div>
              <div className="p-6">
                <div className="flex overflow-x-auto gap-4 pb-4">
                  {weather.hourly.temperature_2m.slice(0, 6).map((temp, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 text-center bg-blue-50 p-4 rounded-lg w-24"
                    >
                      <p className="text-gray-700 font-medium">
                        {new Date(
                          weather.hourly.time[index]
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <div className="my-2">
                        {getWeatherIcon(weather.hourly.weathercode[index])}
                      </div>
                      <p className="text-blue-800 font-bold">{temp}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Forecast */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                <h3 className="text-lg font-semibold">7-Day Forecast</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {weather.daily.time.slice(0, 7).map((date, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between hover:bg-blue-50 p-3 rounded-lg transition duration-200"
                    >
                      <div className="flex items-center">
                        <span className="w-12 font-medium text-gray-700">
                          {new Date(date).toLocaleDateString(undefined, {
                            weekday: "short",
                          })}
                        </span>
                        <div className="ml-4">
                          {getWeatherIcon(weather.daily.weathercode[i])}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-800">
                          {weather.daily.temperature_2m_min[i]}° -{" "}
                          {weather.daily.temperature_2m_max[i]}°
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
