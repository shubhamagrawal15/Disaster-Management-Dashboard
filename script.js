const API_URL = "http://localhost:5000";

// Get Weather Updates
async function fetchWeather() {
  const location = document.getElementById("weather-location").value;
  const response = await fetch(`${API_URL}/weather/${location}`);
  const data = await response.json();
  document.getElementById("weather-info").innerHTML = `Temperature: ${data.main.temp}°C, Condition: ${data.weather[0].description}`;
}

// Get Disaster Alerts
async function fetchDisasterAlerts() {
  const location = document.getElementById("alert-location").value;
  const response = await fetch(`${API_URL}/alerts/${location}`);
  const alerts = await response.json();
  document.getElementById("disaster-alerts").innerHTML = alerts.map(alert => `<li>${alert.alert} (${alert.severity})</li>`).join("");
}

// Report Missing Person
async function reportMissingPerson() {
  const name = document.getElementById("person-name").value;
  const location = document.getElementById("person-location").value;
  await fetch(`${API_URL}/missing`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, location }) });
  fetchMissingPersons();
}

// Get Missing Persons
async function fetchMissingPersons() {
  const response = await fetch(`${API_URL}/missing`);
  const persons = await response.json();
  document.getElementById("missing-persons-list").innerHTML = persons.map(p => `<li>${p.name} - ${p.location}</li>`).join("");
}

// Post Community Update
async function postCommunityUpdate() {
  const update = document.getElementById("update-text").value;
  await fetch(`${API_URL}/updates`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ update }) });
  fetchCommunityUpdates();
}

// Get Community Updates
async function fetchCommunityUpdates() {
  const response = await fetch(`${API_URL}/updates`);
  const updates = await response.json();
  document.getElementById("community-updates").innerHTML = updates.map(u => `<li>${u.update}</li>`).join("");
}

// Add Emergency Contact
async function addEmergencyContact() {
  const name = document.getElementById("contact-name").value;
  const number = document.getElementById("contact-number").value;
  const address = document.getElementById("contact-address").value;
  const agency = document.getElementById("contact-agency").value;
  await fetch(`${API_URL}/contacts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, number, address, agency }) });
  fetchEmergencyContacts();
}

// Search Emergency Contacts
async function fetchEmergencyContacts() {
  const search = document.getElementById("search-contact").value;
  const response = await fetch(`${API_URL}/contacts?search=${search}`);
  const contacts = await response.json();
  document.getElementById("emergency-contacts").innerHTML = contacts.map(c => `<li>${c.name} - ${c.agency} (${c.number})</li>`).join("");
}

async function sendTelegramAlert() {
  const name = document.getElementById("person-name").value;
  const location = document.getElementById("person-location").value;

  if (!name || !location) {
      alert("Please enter both name and location.");
      return;
  }

  const response = await fetch("http://localhost:5000/send-telegram-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location })
  });

  const data = await response.json();
  alert(data.message);
}
