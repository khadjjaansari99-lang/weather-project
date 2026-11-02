// Get HTML Elements

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const weatherInfo = document.getElementById("weatherInfo");

const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");


// Search Button Event

searchBtn.addEventListener("click", getWeather);


// Enter Key Event

cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});


// Main Weather Function

async function getWeather() {

    const city = cityInput.value.trim();

    // Check Empty Input

    if (city === "") {
        message.textContent = "Please enter a city name.";
        weatherInfo.hidden = true;
        return;
    }

    searchBtn.disabled = true;
    message.textContent = "Loading weather...";
    weatherInfo.hidden = true;

    try {

        // Step 1: Find City Coordinates

        const geoURL =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please try another name.");
        }

        const place = geoData.results[0];

        const latitude = place.latitude;
        const longitude = place.longitude;

        // Step 2: Get Weather Data

        const weatherURL =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + latitude +
            "&longitude=" + longitude +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m" +
            "&timezone=auto";

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Unable to get weather information.");
        }

        const weatherData = await weatherResponse.json();

        const current = weatherData.current;

        // Step 3: Display Weather

        cityName.textContent =
            place.name +
            (place.country ? ", " + place.country : "");

        temperature.textContent =
            Math.round(current.temperature_2m) + "°C";

        humidity.textContent =
            current.relative_humidity_2m + "%";

        windSpeed.textContent =
            current.wind_speed_10m + " km/h";

        // Weather Description and Icon

        const weather = getWeatherDescription(
            current.weather_code,
            current.is_day
        );

        description.textContent = weather.text;
        weatherIcon.textContent = weather.icon;

        // Show Weather Card

        weatherInfo.hidden = false;
        message.textContent = "";

    } catch (error) {

        message.textContent =
            error.message ||
            "Something went wrong. Please try again.";

        weatherInfo.hidden = true;

    } finally {

        searchBtn.disabled = false;

    }
}


// Weather Code Function

function getWeatherDescription(code, isDay) {

    if (code === 0) {
        return {
            text: "Clear Sky",
            icon: isDay ? "☀️" : "🌙"
        };
    }

    if (code === 1) {
        return {
            text: "Mainly Clear",
            icon: "🌤️"
        };
    }

    if (code === 2) {
        return {
            text: "Partly Cloudy",
            icon: "⛅"
        };
    }

    if (code === 3) {
        return {
            text: "Overcast",
            icon: "☁️"
        };
    }

    if ([45, 48].includes(code)) {
        return {
            text: "Foggy",
            icon: "🌫️"
        };
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return {
            text: "Drizzle",
            icon: "🌦️"
        };
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return {
            text: "Rainy",
            icon: "🌧️"
        };
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return {
            text: "Snowy",
            icon: "❄️"
        };
    }

    if ([95, 96, 99].includes(code)) {
        return {
            text: "Thunderstorm",
            icon: "⛈️"
        };
    }

    return {
        text: "Weather Unavailable",
        icon: "🌍"
    };
}