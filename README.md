# SKYE — Weather Intelligence 🌤️

A modern, interactive weather web application built with React, featuring real-time forecasts, animated visuals, and an interactive map experience.

## 🚀 Live Features

- 🌍 Search weather by city
- 🗺️ Interactive map (click anywhere to get weather data)
- 📍 Auto-detect user location
- 🌡️ Current weather conditions with "feels like" temperature
- 📊 Hourly forecast (next 24 hours)
- 📅 7-day weather forecast
- 🌅 Sunrise & sunset times
- 💨 Wind speed and direction
- ☀️ UV Index with visual indicator
- 🌧️ Precipitation probability
- 🎨 Dynamic UI based on weather conditions
- 🌙 Light/Dark mode toggle
- 🌡️ Celsius / Fahrenheit toggle
- ✨ Animated weather icons and particles

---

## 🛠️ Tech Stack

- **Frontend:** React (Hooks)
- **Animations:** Framer Motion
- **Maps:** Leaflet.js
- **API:** Open-Meteo API
- **Geocoding:** Open-Meteo Geocoding + OpenStreetMap (Nominatim)
- **Styling:** TailwindCSS (utility-first)

---

## 🧠 Key Features Explained

### 🔍 Smart Search
Search any city worldwide and instantly get weather data.

### 🗺️ Interactive Map
Click anywhere on the map to fetch weather data for that exact location.

### 🎨 Dynamic UI
The interface adapts visually depending on weather conditions (sunny, rain, snow, etc.).

### ⚡ Performance Optimized
- Efficient state management
- Minimal re-renders
- Map decoupled from theme for stability

---

## 📦 Installation

```bash
git clone https://github.com/Adrxn2000/weather-app.git
cd weather-app
npm install
npm run dev
