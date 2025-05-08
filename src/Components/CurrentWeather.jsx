

function CurrentWeather(){

    return (
        <>  
            <div className="latest-weather">
            <div className="updated-weather-icon">
              {getWeatherIcon(weather.hourly.weathercode[0])}
            </div>
            <div className="updated-weather-details">
              <h2>{location}</h2>
              <p>{new Date(weather.hourly.time[0]).toLocaleDateString()}</p>
              <p className="latest-temp">{weather.hourly.temperature_2m[0]}°C</p>
            </div>
          </div>

        </>
    )
}

export default CurrentWeather;