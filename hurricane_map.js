const alertsDiv = document.getElementById('alerts');
const notifyToggle = document.getElementById('notifyToggle');

if ('Notification' in window) Notification.requestPermission();

// Initialize map
const map = L.map('map').setView([25, -80], 4); // Default: Florida region
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors'
}).addTo(map);

let hurricaneMarkers = [];

// Fetch and display hurricanes
async function updateHurricanes() {
  try {
    // Fetch hurricane JSON from GitHub (free public JSON)
    const res = await fetch('https://raw.githubusercontent.com/fillyourcloud/nhc-json/main/current.json');
    const data = await res.json();

    // Clear previous markers
    hurricaneMarkers.forEach(marker => map.removeLayer(marker));
    hurricaneMarkers = [];

    if (!data.storms || data.storms.length === 0) {
      alertsDiv.innerHTML = "No active hurricanes at this time.";
      return;
    }

    let alertText = "";
    data.storms.forEach(storm => {
      if (storm.type.toLowerCase() === "hurricane") {
        // Color by category
        let color = storm.category >= 3 ? 'red' : storm.category === 2 ? 'orange' : 'yellow';

        // Add marker
        const marker = L.circleMarker([storm.lat, storm.lon], {
          radius: 15,
          color: color,
          fillColor: color,
          fillOpacity: 0.6
        }).addTo(map).bindPopup(`<b>${storm.name}</b><br>Category: ${storm.category}`);
        hurricaneMarkers.push(marker);

        // Update alert panel
        alertText += `⚠️ Hurricane ${storm.name} - Category ${storm.category}<br>`;

        // Notifications
        if (notifyToggle.checked && Notification.permission === "granted") {
          new Notification(`Hurricane: ${storm.name}`, {
            body: `Category ${storm.category}`,
            icon: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Tropical_cyclone_icon.svg'
          });
        }
      }
    });

    alertsDiv.innerHTML = alertText;

  } catch (err) {
    console.error(err);
    alertsDiv.innerHTML = "Error fetching hurricane data.";
  }
}

// Refresh every 10 minutes
updateHurricanes();
setInterval(updateHurricanes, 600000);
