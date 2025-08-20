const weatherDiv = document.getElementById('weather');
const alertsDiv = document.getElementById('alerts');
const notifyToggle = document.getElementById('notifyToggle');

// Replace with your own API key from OpenWeatherMap
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
const LAT = 'YOUR_LATITUDE';
const LON = 'YOUR_LONGITUDE';

// Request permission for notifications
if ('Notification' in window) {
  Notification.requestPermission();
}

async function getWeather() {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${LAT}&lon=${LON}&exclude=minutely,hourly&appid=${API_KEY}&units=imperial`);
    const data = await res.json();

    const temp = data.current.temp;
    const weather = data.current.weather[0].description;
    weatherDiv.innerHTML = `<h2>Current Temperature: ${temp}°F</h2><p>Condition: ${weather}</p>`;

    if (data.alerts && data.alerts.length > 0) {
      data.alerts.forEach(alert => {
        if (alert.event.toLowerCase().includes('hurricane')) {
          alertsDiv.innerHTML = `⚠️ Hurricane Alert: ${alert.event} <br>${alert.description}`;
          if (notifyToggle.checked && Notification.permission === "granted") {
            new Notification(`Hurricane Alert: ${alert.event}`, {
              body: alert.description,
              icon: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Tropical_cyclone_icon.svg'
            });
          }
        }
      });
    } else {
      alertsDiv.innerHTML = `No severe alerts at this time.`;
    }

  } catch (err) {
    weatherDiv.innerHTML = `<p>Error fetching weather data</p>`;
    console.error(err);
  }
}

// Refresh every 10 minutes
getWeather();
setInterval(getWeather, 600000);
