import {useState} from "react";
import axios from "axios";
import SearchBar from "../Components/SearchBar";
import {motion} from "framer-motion";
import "./style.css";

import { WiDaySunny, WiCloud, WiRain, WiStrongWind } from "react-icons/wi";

function home(){
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
   setLoading(true); // Set loading state to true
  //  console.log(`Fetching weather data for ${location}`);
     
        try{
            // Convert location name to latitude and longitude
            const geoResponse = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);

            if(geoResponse.data.length === 0){
                alert("Location not found. Please try again.");
                setLoading(false); // Set loading state to false
                return;
            }

            const{lat, lon} = geoResponse.data[0];

            // fetch weather data from Open-Meteo API
            const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weathercode&timezone=auto`);
            // console.log("Weather response", weatherResponse.data); // log weather response
            setWeather(weatherResponse.data);
          } catch (error){

            console.error("Error fetching weather data", error);
        }finally{
          setLoading(false); // Set loading state to false
        }

        // const data = await response.json();
        //  setWeather(data);
    };

    return(
        <div className="container">
          <h1 className="title">🌎 Weather App</h1>
          <div className="search-bar">
            
         
            <input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)} // Handle location input
            className="location-input"
            />
            <button onClick={fetchWeather} className="fetch-button">
              🔄 get Weather
            </button>
            </div>
            {loading && <p className="loading">⏳Loading...</p>}

{/* {Displays weather data} */}

{weather && weather.hourly && weather.hourly.temperature_2m &&(
  <motion.div
    className="weather-card"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <h2>Weather in {location}</h2>
    <ul className="weather-list">
      {weather.hourly.temperature_2m.slice(0, 6).map((temp, index) => (
        
        <motion.li
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="weather-item"
        >
          <span className="hour">
             {new Date(weather.hourly.time[index]).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                })
                
              }
          </span>
          <span className="temp">🌡️ {temp}°C</span>
          <span className="humidity">
            💧 {weather.hourly.relative_humidity_2m[index]}%
          </span>

          <span className="wind">
            💨 {weather.hourly.wind_speed_10m[index]}km/h
          </span>
          <span className="precip">
            🌧️ {weather.hourly.precipitation_probability[index]}%
            </span>
          <span className="weather-icon">{getWeatherIcon(weather.hourly.weather-code[index])}</span>

        </motion.li>
      ))}
    </ul>
  </motion.div>
): 
 (
  <p classname="no-data">🌍 Enter a city to see the weather.</p>
)}
</div>
);
}

export default home;