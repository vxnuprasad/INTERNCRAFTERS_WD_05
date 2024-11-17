const API_KEY = "6406186347fef057c09193d17c66bc7e"; // OpenWeather API key
const TIMEZONE_API_KEY = "YL5855WVT6AF"; // TimeZoneDB API key
const TIMEZONE_API_URL = "https://api.timezonedb.com/v2.1/get-time-zone";

// Elements
const locationInput = document.getElementById("location-input");
const searchButton = document.getElementById("search-button");
const weatherDetails = document.getElementById("weather-details");
const locationName = document.getElementById("location-name");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const time = document.getElementById("time");
const weatherIcon = document.getElementById("weather-icon");

// Fetch weather and time
async function fetchWeatherAndTime(location, lat = null, lon = null) {
  try {
    let geolocationData;

    if (lat !== null && lon !== null) {
      geolocationData = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`).then(res => res.json());
    } else {
      geolocationData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}`).then(res => res.json());
    }

    if (geolocationData.cod !== 200) throw new Error(geolocationData.message);

    const { lat: latitude, lon: longitude } = geolocationData.coord;
    const timezoneResponse = await fetch(`${TIMEZONE_API_URL}?key=${TIMEZONE_API_KEY}&format=json&by=position&lat=${latitude}&lng=${longitude}`).then(res => res.json());
    if (!timezoneResponse.formatted) throw new Error("Failed to fetch time data.");

    updateWeatherUI(geolocationData, new Date(timezoneResponse.formatted));
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Update UI
function updateWeatherUI(data, localTime) {
  weatherDetails.classList.remove("hidden");
  locationName.textContent = `${data.name}, ${data.sys.country}`;
  const tempInCelsius = (data.main.temp - 273.15).toFixed(1);
  temperature.textContent = `${tempInCelsius}°C`;
  conditions.textContent = `Conditions: ${data.weather[0].description}`;
  const icon = data.weather[0].icon;
  weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${data.weather[0].description}" />`;
  time.textContent = `Current Date and Time: ${localTime.toLocaleString()}`;
}

// Fetch user's current location
function fetchUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherAndTime(null, latitude, longitude);
    }, () => {
      alert("Unable to fetch location.");
    });
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

// Event Listeners
searchButton.addEventListener("click", () => {
  const location = locationInput.value.trim();
  if (location) fetchWeatherAndTime(location);
});

window.onload = fetchUserLocation;
