// script.js

const apiKey = "26fc70872653ea53761daa15d68d5031"; // vendos këtu API key nga OpenWeatherMap
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");

const weatherSection = document.getElementById("weather");
const errorMsg = document.getElementById("error");

const cityNameEl = document.getElementById("city-name");
const dateEl = document.getElementById("date");
const iconEl = document.getElementById("weather-icon");
const tempEl = document.getElementById("temperature");
const descEl = document.getElementById("description");
const windEl = document.getElementById("wind");
const humidityEl = document.getElementById("humidity");

// Merr datën aktuale në format të bukur
function formatDate() {
  const now = new Date();
  return now.toLocaleDateString("en-En", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Funksioni që kërkon motin
async function getWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=sq&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Qyteti nuk u gjet");
    }

    const data = await response.json();

    // Vendos të dhënat
    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    dateEl.textContent = formatDate();
    tempEl.textContent = `${Math.round(data.main.temp)}°C`;
    descEl.textContent = data.weather[0].description;
    windEl.textContent = data.wind.speed;
    humidityEl.textContent = data.main.humidity;
    iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    weatherSection.classList.remove("hidden");
    errorMsg.classList.add("hidden");
  } catch (error) {
    weatherSection.classList.add("hidden");
    errorMsg.classList.remove("hidden");
  }
}

// Event kur klikohet butoni
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  }
});

// Lejo enter në input
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchBtn.click();
  }
});
