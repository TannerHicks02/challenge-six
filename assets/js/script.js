const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={85e8e50c0638158bb1ea7e74539f5bdb}';
const apiKey = '85e8e50c0638158bb1ea7e74539f5bdb'; // Replace with your actual API key

const cityForm = document.getElementById('city-form');
const cityInput = document.getElementById('city-input');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const historyList = document.getElementById('history-list');

// Function to fetch coordinates for a city
async function getCityCoordinates(city) {
    const response = await fetch(`${weatherApiUrl}?q=${city}&appid=${apiKey}`);
    const data = await response.json();
    return { lat: data.coord.lat, lon: data.coord.lon };
}

// Function to fetch weather data for given coordinates
async function getWeatherData(lat, lon) {
    const response = await fetch(`${weatherApiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    const data = await response.json();
    return data;
}

// Function to display current weather
function displayCurrentWeather(data) {
    const { name, weather, main, wind } = data.list[0];
    const weatherHtml = `
        <h2>${name} (${new Date().toLocaleDateString()})</h2>
        <img src="http://openweathermap.org/img/wn/${weather[0].icon}.png" alt="${weather[0].description}">
        <p>Temperature: ${main.temp}°C</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Wind Speed: ${wind.speed} m/s</p>
    `;
    currentWeatherDiv.innerHTML = weatherHtml;
}

// Function to display 5-day forecast
function displayForecast(data) {
    const forecastHtml = data.list.filter(item => item.dt_txt.includes('12:00:00')).map(item => {
        const { dt, weather, main, wind } = item;
        return `
            <div>
                <h3>${new Date(dt * 1000).toLocaleDateString()}</h3>
                <img src="http://openweathermap.org/img/wn/${weather[0].icon}.png" alt="${weather[0].description}">
                <p>Temperature: ${main.temp}°C</p>
                <p>Humidity: ${main.humidity}%</p>
                <p>Wind Speed: ${wind.speed} m/s</p>
            </div>
        `;
    }).join('');
    forecastDiv.innerHTML = forecastHtml;
}

// Function to handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        const coords = await getCityCoordinates(city);
        const weatherData = await getWeatherData(coords.lat, coords.lon);
        displayCurrentWeather(weatherData);
        displayForecast(weatherData);
        saveToHistory(city);
        cityInput.value = '';
    }
}

// Function to save city to local storage
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!history.includes(city)) {
        history.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        updateHistoryList();
    }
}

// Function to update history list from local storage
function updateHistoryList() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    historyList.innerHTML = history.map(city => `<li><button onclick="loadCityWeather('${city}')">${city}</button></li>`).join('');
}

// Function to load weather data for a city from history
async function loadCityWeather(city) {
    const coords = await getCityCoordinates(city);
    const weatherData = await getWeatherData(coords.lat, coords.lon);
    displayCurrentWeather(weatherData);
    displayForecast(weatherData);
}

// Initial setup
cityForm.addEventListener('submit', handleFormSubmit);
updateHistoryList();