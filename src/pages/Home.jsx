import {useState} from 'react';
import axios from 'axios';
import Clock from '../Components/Clock';
import {motion} from "framer-motion";
import { div } from 'framer-motion/client';
import { WiDaySunny, WiCloud, WiRain, WiStrongWind } from 'react-icons/wi';

function home(){
    const [location, setLocation] = useState("");
    const [weather, setWeather] = useState(null);

    const getWeatherIcon = (code) => {
        if (code === 0) return <WiDaySunny />;
        if (code >= 1 && code <= 3) return <WiCloud />;
        if (code === 61) return <WiRain />;
        return <WiStrongWind />;
      };

    const getWeatherCondition = (code) =>{
        const conditions = {
            0:"Clear sky",
            1:"Mainly clear sky",
            2:"Partly cloudy",
            3:"Overcast",
            61:"Rain showers",
            80:"Thunderstorm",
        };
        return conditions[code] || "Unknown";
    };

    const fetchWeather = async () => {
        console.log(`Fetching weather data for ${location}`);
        // const URL =`https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m`;

        try{
            // Convert location name to latitute and longitude
            const geoResponse = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);

            console.log("Geo response", geoResponse.data);

            if(geoResponse.data.length === 0){
                console.error("Location not found");
                return;
            }

            const{lat, lon} = geoResponse.data[0];

            // fetch weather data from Open-Meteo API
            const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,wind_speed_10m,precipitation_probability,weathercode&timezone=auto`);
            

            console.log("Weather response", weatherResponse.data); // log weather response
            
            setWeather(weatherResponse.data);
        } catch (error){
            console.error("Error fetching weather data", error);
        }
    };

    return(
        <div>
            <input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)} // Handle location input
            />
            <button onClick={fetchWeather}>🔄 Refresh Weather</button>

            {/* Display Temperature */}
            import { motion } from "framer-motion";

{weather && weather.hourly && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h2>Weather Details</h2>
    <ul>
      {weather.hourly.temperature_2m.slice(0, 24).map((temp, index) => (
        <motion.li
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          Hour {index + 1}: {temp}°C
        </motion.li>
      ))}
    </ul>
  </motion.div>
)}
{/* Display Wind Speed */}
        </div>
    );
}

export default home;