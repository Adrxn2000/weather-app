import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiStrongWind,
} from "react-icons/wi";

function Home() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const getWeatherIcon = (code) => {
    if (code === 0) return <WiDaySunny />;
    if (code >= 1 && code <= 3) return <WiCloud />;
    if (code === 61) return <WiRain />;
    return <WiStrongWind />;
  };

  const fetchWeather = async () => {
    setLoading(true);

    try {
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${location}`
      );

      if (geoResponse.data.length === 0) {
        alert("Location not found. Please try again.");
        setLoading(false);
        return;
      }

      const { lat, lon } = geoResponse.data[0];

      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto`
      );

      setWeather(weatherResponse.data);
    } catch (error) {
      console.error("Error fetching weather data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-app">
      <h1 className="title">🌤️ Weather Dashboard</h1>

      {/* Search Input */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search city"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={fetchWeather}>Search</button>
      </div>

      {loading && <p className="loading">Loading...</p>}

      {/* Weather Data */}
      {weather && weather.hourly && (
        <motion.div
          className="weather-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Current Weather */}
          <div className="current-weather">
            <div className="weather-icon">
              {getWeatherIcon(weather.hourly.weathercode[0])}
            </div>
            <div className="weather-details">
              <h2>{location}</h2>
              <p>{new Date(weather.hourly.time[0]).toLocaleDateString()}</p>
              <p className="temp">{weather.hourly.temperature_2m[0]}°C</p>
            </div>
          </div>

          {/* Hourly Forecast */}
          <div className="section-title">Today’s Forecast</div>
          <div className="hourly-scroll">
            {weather.hourly.temperature_2m.slice(0, 6).map((temp, index) => (
              <div className="hour-card" key={index}>
                <p>
                  {new Date(weather.hourly.time[index]).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div>{getWeatherIcon(weather.hourly.weathercode[index])}</div>
                <p>{temp}°C</p>
              </div>
            ))}
          </div>

          {/* Daily Forecast */}
          <div className="section-title">7-Day Forecast</div>
          <div className="daily-forecast">
            {weather.daily.time.slice(0, 7).map((date, i) => (
              <div className="day-card" key={i}>
                <p>
                  {new Date(date).toLocaleDateString(undefined, {
                    weekday: "short",
                  })}
                </p>
                <div>{getWeatherIcon(weather.daily.weathercode[i])}</div>
                <p>
                  {weather.daily.temperature_2m_min[i]}° - {" "}
                  {weather.daily.temperature_2m_max[i]}°
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Home;
