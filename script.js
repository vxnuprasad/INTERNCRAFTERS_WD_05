const API_KEY = "6406186347fef057c09193d17c66bc7e"; // OpenWeather API key
const TIMEZONE_API_KEY = "YL5855WVT6AF"; // TimeZoneDB API key
const TIMEZONE_API_URL = "https://api.timezonedb.com/v2.1/get-time-zone"; // TimeZoneDB base URL

// Elements from the HTML for displaying data
const locationInput = document.getElementById("location-input");
const searchButton = document.getElementById("search-button");
const weatherDetails = document.getElementById("weather-details");
const locationName = document.getElementById("location-name");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const time = document.getElementById("time");
const weatherIcon = document.getElementById("weather-icon");

// Fetch weather and time data
async function fetchWeatherAndTime(location) {
  try {
    // Step 1: Fetch the location's latitude and longitude from OpenWeather API using the entered city name
    const geolocationResponse = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}`);
    const geolocationData = await geolocationResponse.json();

    // Check for errors in geolocation response
    if (geolocationData.cod !== 200) {
      throw new Error(geolocationData.message);
    }

    // Get the latitude and longitude for the location
    const lat = geolocationData.coord.lat;
    const lon = geolocationData.coord.lon;
    const country = geolocationData.sys.country;
    const city = geolocationData.name;

    // Debug: Log latitude and longitude to console
    console.log(`Latitude: ${lat}, Longitude: ${lon}`);

    // Step 2: Fetch the timezone (region/city) from OpenWeather data
    const timezoneData = await fetchTimezone(lat, lon);
    
    // Step 3: Use the TimeZoneDB API to fetch the current time in the location
    const timezoneResponse = await fetch(`${TIMEZONE_API_URL}?key=${TIMEZONE_API_KEY}&format=json&by=position&lat=${lat}&lng=${lon}`);
    const timezoneDataFromAPI = await timezoneResponse.json();

    // Debug: Log the response from TimeZoneDB to the console
    console.log('TimeZoneDB Response:', timezoneDataFromAPI);

    // Check if the timezone data is valid
    if (!timezoneDataFromAPI || !timezoneDataFromAPI.formatted) {
      throw new Error("Failed to fetch time data.");
    }

    // Convert the formatted time string from TimeZoneDB to a JavaScript Date object
    const localTime = new Date(timezoneDataFromAPI.formatted);

    // Update the UI with both the weather and local time data
    updateWeatherUI(geolocationData, localTime);

  } catch (error) {
    // Display an error alert if something goes wrong
    alert(`Error: ${error.message}`);
  }
}

// Function to fetch timezone data from TimeZoneDB
async function fetchTimezone(lat, lon) {
  try {
    // Call the TimeZoneDB API to get the time information based on lat, lon
    const response = await fetch(`${TIMEZONE_API_URL}?key=${TIMEZONE_API_KEY}&format=json&by=position&lat=${lat}&lng=${lon}`);
    const data = await response.json();

    // If API returns a success, return the formatted date and time
    if (data.status === "OK") {
      return data;
    } else {
      throw new Error("Unable to fetch time from TimeZoneDB.");
    }
  } catch (error) {
    console.error("Error fetching timezone data:", error);
    throw new Error("Error fetching timezone data.");
  }
}

// Function to update the UI with weather and local time
function updateWeatherUI(data, localTime) {
  // Show the weather details container
  weatherDetails.classList.remove("hidden");

  // Display location name (city and country)
  locationName.textContent = `${data.name}, ${data.sys.country}`;
  
  // Convert temperature from Kelvin to Celsius
  const tempInCelsius = (data.main.temp - 273.15).toFixed(1); // Convert and round to 1 decimal

  // Display temperature (in Celsius)
  temperature.textContent = `${tempInCelsius}°C`;
  
  // Display weather conditions (like clear sky, rain, etc.)
  conditions.textContent = `Conditions: ${data.weather[0].description}`;

  // Set the weather icon (using the icon code from OpenWeather)
  const icon = data.weather[0].icon;
  weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${data.weather[0].description}" />`;

  // Format the local time from TimeZoneDB (convert to 12-hour format with AM/PM)
  const day = String(localTime.getDate()).padStart(2, '0'); // Day in DD format
  const month = String(localTime.getMonth() + 1).padStart(2, '0'); // Month in MM format
  const year = localTime.getFullYear(); // Year in YYYY format

  // Get hours, minutes, and seconds
  let hours = localTime.getHours();
  const minutes = String(localTime.getMinutes()).padStart(2, '0'); // Minutes in MM format
  const seconds = String(localTime.getSeconds()).padStart(2, '0'); // Seconds in SS format

  // Determine AM or PM for 12-hour format
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle the case of midnight (00:00) turning to 12:00 AM

  // Format the final local time as "DD/MM/YYYY HH:MM AM/PM"
  const formattedDateTime = `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;

  // Display the current date and time in the UI
  time.textContent = `Current Date and Time: ${formattedDateTime}`;
}

// Event listener for search button to trigger the weather and time fetching
searchButton.addEventListener("click", () => {
  const location = locationInput.value.trim(); // Get the location entered by the user

  if (!location) {
    // Alert if no location is entered
    alert("Please enter a location!");
    return;
  }

  // Call the function to fetch weather and time for the entered location
  fetchWeatherAndTime(location);
});
