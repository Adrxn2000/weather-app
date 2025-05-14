import { useState, useEffect, useCallback } from "react";

export default function Home() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [mapInitialized, setMapInitialized] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  // Weather icon components
  const SunnyIcon = () => (
    <svg viewBox="0 0 24 24" className="text-yellow-400 w-12 h-12">
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
  
  const CloudyIcon = () => (
    <svg viewBox="0 0 24 24" className="text-gray-400 w-12 h-12">
      <path d="M18,10c-0.1,0-0.2,0-0.3,0c-0.5-2.8-3-5-6-5C8.5,5,6,7.1,5.4,10c-2.5,0.6-4.4,2.9-4.4,5.5C1,18.5,3.5,21,7,21h11c2.8,0,5-2.2,5-5 C23,12.2,20.8,10,18,10z" fill="currentColor" />
    </svg>
  );
  
  const RainIcon = () => (
    <svg viewBox="0 0 24 24" className="text-blue-400 w-12 h-12">
      <path d="M18,10c-0.1,0-0.2,0-0.3,0c-0.5-2.8-3-5-6-5C8.5,5,6,7.1,5.4,10c-2.5,0.6-4.4,2.9-4.4,5.5C1,18.5,3.5,21,7,21h11c2.8,0,5-2.2,5-5 C23,12.2,20.8,10,18,10z" fill="currentColor" />
      <path d="M9,17v3M12,19v3M15,17v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  
  const PartlyCloudyIcon = () => (
    <svg viewBox="0 0 24 24" className="text-gray-500 w-12 h-12">
      <circle cx="8" cy="8" r="4" fill="#f59e0b" />
      <path d="M18,12c-0.1,0-0.2,0-0.3,0c-0.5-2.8-3-5-6-5c-2,0-3.8,1-4.9,2.5 M5.4,12c-2.5,0.6-4.4,2.9-4.4,5.5C1,20.5,3.5,23,7,23h11c2.8,0,5-2.2,5-5 C23,14.2,20.8,12,18,12z" fill="currentColor" />
    </svg>
  );
  
  const WindIcon = () => (
    <svg viewBox="0 0 24 24" className="text-gray-600 w-8 h-8 mx-auto">
      <path d="M3,12h12.5c1.4,0,2.5-1.1,2.5-2.5S16.9,7,15.5,7c-0.9,0-1.7,0.5-2.1,1.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5,15h12.5c1.4,0,2.5,1.1,2.5,2.5S18.9,20,17.5,20c-0.9,0-1.7-0.5-2.1-1.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3,8h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  
  const HumidityIcon = () => (
    <svg viewBox="0 0 24 24" className="text-blue-500 w-8 h-8 mx-auto">
      <path d="M12,2.5L5.5,9c-2.1,2.1-2.1,5.5,0,7.6c1.1,1.1,2.5,1.6,3.9,1.6s2.8-0.5,3.9-1.6c1.1-1.1,1.6-2.5,1.6-3.9s-0.5-2.8-1.6-3.9L12,2.5z" 
        fill="currentColor" />
    </svg>
  );
  
  const PrecipitationIcon = () => (
    <svg viewBox="0 0 24 24" className="text-blue-500 w-8 h-8 mx-auto">
      <path d="M12,2c0,0-10,12.8-10,18c0,5.2,4.5,9.5,10,9.5s10-4.2,10-9.5C22,14.8,12,2,12,2z" 
        fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M9,17.5v3M12,20v3M15,17.5v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  // Function to get the appropriate weather icon based on the weather code
  const getWeatherIcon = (code) => {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    if (code === 0) {
      return <SunnyIcon />;  // Clear sky
    } else if (code >= 1 && code <= 3) {
      return <PartlyCloudyIcon />;  // Partly cloudy
    } else if (code >= 45 && code <= 48) {
      return <CloudyIcon />;  // Fog
    } else if (code >= 51 && code <= 67) {
      return <RainIcon />;  // Drizzle or rain
    } else if (code >= 71 && code <= 86) {
      return <RainIcon />;  // Snow fall
    } else if (code >= 95 && code <= 99) {
      return <RainIcon />;  // Thunderstorm
    } else {
      return <CloudyIcon />;  // Default
    }
  };

  // Mock data for fallback when API fails
  const getMockWeatherData = (cityName = "Sample City") => {
    const now = new Date();
    const hourlyTimes = Array(24).fill().map((_, i) => {
      const time = new Date(now);
      time.setHours(time.getHours() + i);
      return time.toISOString();
    });
    
    const dailyTimes = Array(7).fill().map((_, i) => {
      const time = new Date(now);
      time.setDate(time.getDate() + i);
      return time.toISOString();
    });
    
    return {
      hourly: {
        time: hourlyTimes,
        temperature_2m: Array(24).fill().map(() => Math.round(15 + Math.random() * 10)),
        relativehumidity_2m: Array(24).fill().map(() => Math.round(40 + Math.random() * 40)),
        precipitation_probability: Array(24).fill().map(() => Math.round(Math.random() * 70)),
        weathercode: Array(24).fill().map(() => [0, 1, 2, 3, 61][Math.floor(Math.random() * 5)]),
        windspeed_10m: Array(24).fill().map(() => Math.round(5 + Math.random() * 15))
      },
      daily: {
        time: dailyTimes,
        weathercode: Array(7).fill().map(() => [0, 1, 2, 3, 61][Math.floor(Math.random() * 5)]),
        temperature_2m_min: Array(7).fill().map(() => Math.round(10 + Math.random() * 8)),
        temperature_2m_max: Array(7).fill().map(() => Math.round(18 + Math.random() * 10))
      }
    };
  };

  // Function to get city coordinates by name using Geocoding API
  const geocodeCity = async (cityName) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1&language=en&format=json`,
        { 
          signal: controller.signal,
          mode: 'cors',
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error("Failed to find location");
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        throw new Error("City not found");
      }
      
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        name: data.results[0].name,
        country: data.results[0].country
      };
    } catch (error) {
      console.error("Error geocoding city:", error);
      
      // Provide mock data with city name for development/demo purposes
      console.log("Using mock data for location:", cityName);
      return {
        lat: 40.7128,
        lon: -74.006,
        name: cityName,
        country: "Demo Mode"
      };
    }
  };

  // Function to fetch weather data using Open-Meteo API
  const fetchWeatherData = async (lat, lon) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`,
        { 
          signal: controller.signal,
          mode: 'cors',
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching weather:", error);
      
      // Return mock data for development/demo purposes
      console.log("Using mock weather data");
      return getMockWeatherData();
    }
  };

  // Initialize Leaflet map
  const initializeMap = useCallback(() => {
    // Check if leaflet is available
    if (typeof window !== 'undefined' && !window.L) {
      // Dynamically load Leaflet CSS and JS
      const linkEl = document.createElement('link');
      linkEl.rel = 'stylesheet';
      linkEl.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
      document.head.appendChild(linkEl);
      
      const scriptEl = document.createElement('script');
      scriptEl.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
      scriptEl.onload = () => {
        createMap();
      };
      document.body.appendChild(scriptEl);
    } else if (typeof window !== 'undefined' && window.L) {
      createMap();
    }
  }, []);

  // Create map instance
  const createMap = useCallback(() => {
    if (!mapInitialized && typeof window !== 'undefined' && window.L) {
      // Default coordinates (New York City)
      const defaultLat = coordinates.lat || 40.7128;
      const defaultLon = coordinates.lon || -74.006;
      
      // Create map
      const mapInstance = window.L.map('weatherMap').setView([defaultLat, defaultLon], 10);
      
      // Add OpenStreetMap tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);
      
      // Add marker
      const markerInstance = window.L.marker([defaultLat, defaultLon]).addTo(mapInstance);
      
      setMap(mapInstance);
      setMarker(markerInstance);
      setMapInitialized(true);
    }
  }, [coordinates.lat, coordinates.lon, mapInitialized]);

  // Update map when coordinates change
  useEffect(() => {
    if (map && marker && coordinates.lat && coordinates.lon) {
      const newLatLng = [coordinates.lat, coordinates.lon];
      map.setView(newLatLng, 10);
      marker.setLatLng(newLatLng);
      
      // Add popup with location name and temperature
      if (weather) {
        marker.bindPopup(`
          <b>${coordinates.displayName || "Location"}</b><br>
          Temperature: ${Math.round(weather.hourly.temperature_2m[0])}°C
        `).openPopup();
      }
    }
  }, [coordinates, map, marker, weather]);

  // Initialize map on component mount
  useEffect(() => {
    if (!mapInitialized) {
      initializeMap();
    }
  }, [initializeMap, mapInitialized]);

  // Main function to handle weather search
  const handleWeatherSearch = async () => {
    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Store the search term to use in fallback
      const searchTerm = location;
      
      const geoData = await geocodeCity(searchTerm);
      setCoordinates({ 
        lat: geoData.lat, 
        lon: geoData.lon,
        displayName: `${geoData.name}, ${geoData.country}`
      });
      
      const weatherData = await fetchWeatherData(geoData.lat, geoData.lon);
      
      // Verify we got necessary data fields
      if (!verifyWeatherData(weatherData)) {
        throw new Error("Incomplete weather data received");
      }
      
      setWeather(weatherData);
    } catch (err) {
      console.error("Weather search error:", err);
      
      // Show a user-friendly error but continue with mock data
      setError("Could not connect to weather service. Showing demo data instead.");
      
      // Create mock data using the location name
      const mockGeoData = {
        lat: 40.7128,
        lon: -74.006,
        displayName: `${location || "Sample City"} (Demo Mode)`
      };
      setCoordinates(mockGeoData);
      
      // Set mock weather data
      setWeather(getMockWeatherData(location));
    } finally {
      setLoading(false);
    }
  };

  // Function to verify weather data has all required fields
  const verifyWeatherData = (data) => {
    if (!data || !data.hourly || !data.daily) return false;
    
    const hourlyRequired = ['time', 'temperature_2m', 'relativehumidity_2m', 
                          'precipitation_probability', 'weathercode', 'windspeed_10m'];
    const dailyRequired = ['time', 'weathercode', 'temperature_2m_min', 'temperature_2m_max'];
    
    return hourlyRequired.every(field => Array.isArray(data.hourly[field])) && 
           dailyRequired.every(field => Array.isArray(data.daily[field]));
  };

  // Get current location on initial load
  useEffect(() => {
    const getInitialWeather = async () => {
      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              maximumAge: 60000
            });
          });
          
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            displayName: "Current Location"
          });
          
          setLoading(true);
          const weatherData = await fetchWeatherData(
            position.coords.latitude,
            position.coords.longitude
          );
          
          if (verifyWeatherData(weatherData)) {
            setWeather(weatherData);
          } else {
            throw new Error("Incomplete weather data");
          }
        } else {
          throw new Error("Geolocation not supported");
        }
      } catch (err) {
        console.log("Initial weather fetch error:", err);
        
        // Silently fall back to demo data without showing error
        const mockGeoData = {
          lat: 40.7128,
          lon: -74.006,
          displayName: "New York (Demo Mode)"
        };
        setCoordinates(mockGeoData);
        setWeather(getMockWeatherData("New York"));
      } finally {
        setLoading(false);
      }
    };
    
    getInitialWeather();
  }, []);

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
            onKeyPress={(e) => e.key === 'Enter' && handleWeatherSearch()}
            className="flex-1 p-3 rounded-lg shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleWeatherSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-200"
          >
            Search
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {weather && (
          <div className="space-y-8">
            {/* Current Weather and Map */}
            <div className="grid md:grid-cols-2 gap-8">
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
                        <h2 className="text-2xl font-bold">{coordinates.displayName || "Unknown Location"}</h2>
                        <p className="text-gray-600">{new Date(weather.hourly.time[0]).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-5xl font-bold text-blue-800">{Math.round(weather.hourly.temperature_2m[0])}°C</p>
                      <p className="text-gray-600">Feels like {Math.round(weather.hourly.temperature_2m[0])}°C</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-8 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <HumidityIcon />
                      <p className="text-gray-600 mt-1">Humidity</p>
                      <p className="font-semibold">{weather.hourly.relativehumidity_2m[0]}%</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <WindIcon />
                      <p className="text-gray-600 mt-1">Wind</p>
                      <p className="font-semibold">{weather.hourly.windspeed_10m[0]} km/h</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <PrecipitationIcon />
                      <p className="text-gray-600 mt-1">Precipitation</p>
                      <p className="font-semibold">{weather.hourly.precipitation_probability[0]}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Map */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <h3 className="text-lg font-semibold">Location Map</h3>
                </div>
                <div className="p-0">
                  <div id="weatherMap" className="h-96 w-full z-0"></div>
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
                  {weather.hourly.time.slice(0, 24).filter((_, i) => i % 4 === 0).map((time, index) => {
                    const dataIndex = index * 4;
                    return (
                      <div key={index} className="flex-shrink-0 text-center bg-blue-50 p-4 rounded-lg w-24">
                        <p className="text-gray-700 font-medium">
                          {new Date(time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="my-2">
                          {getWeatherIcon(weather.hourly.weathercode[dataIndex])}
                        </div>
                        <p className="text-blue-800 font-bold">{Math.round(weather.hourly.temperature_2m[dataIndex])}°C</p>
                        <p className="text-xs text-gray-500">{weather.hourly.precipitation_probability[dataIndex]}% rain</p>
                      </div>
                    );
                  })}
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
                  {weather.daily.time.map((date, i) => (
                    <div key={i} className="flex items-center justify-between hover:bg-blue-50 p-3 rounded-lg transition duration-200">
                      <div className="flex items-center">
                        <span className="w-16 font-medium text-gray-700">
                          {i === 0 ? "Today" : new Date(date).toLocaleDateString(undefined, {
                            weekday: "short",
                          })}
                        </span>
                        <div className="ml-4">
                          {getWeatherIcon(weather.daily.weathercode[i])}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-800">
                          {Math.round(weather.daily.temperature_2m_min[i])}° - {" "}
                          {Math.round(weather.daily.temperature_2m_max[i])}°
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