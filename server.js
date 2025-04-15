require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Connect to MongoDB Atlas
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Initialize Telegram Bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Mongoose Schemas
const MissingPerson = mongoose.model("MissingPerson", new mongoose.Schema({
  name: String,
  location: String,
}));

const CommunityUpdate = mongoose.model("CommunityUpdate", new mongoose.Schema({
  update: String,
  timestamp: { type: Date, default: Date.now },
}));

const EmergencyContact = mongoose.model("EmergencyContact", new mongoose.Schema({
  name: String,
  number: String,
  address: String,
  agency: String,
}));

// 1. Get Weather Updates
app.get("/weather/:location", async (req, res) => {
  try {
    const { location } = req.params;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}&units=metric`;
    const response = await axios.get(weatherUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

// 2. Get Disaster Alerts (Mock Data)
app.get("/alerts/:location", async (req, res) => {
  const { location } = req.params;
  const alerts = [
    { location, alert: "Flood Warning", severity: "High" },
    { location, alert: "Tornado Watch", severity: "Medium" },
  ];
  res.json(alerts);
});

// 3. Report & Get Missing Persons
app.post("/missing", async (req, res) => {
  const { name, location } = req.body;
  const newPerson = new MissingPerson({ name, location });
  await newPerson.save();
  res.json({ message: "Missing person reported" });
});

app.get("/missing", async (req, res) => {
  const persons = await MissingPerson.find();
  res.json(persons);
});

// 4. Community Updates
app.post("/updates", async (req, res) => {
  const { update } = req.body;
  const newUpdate = new CommunityUpdate({ update });
  await newUpdate.save();
  res.json({ message: "Community update posted" });
});

app.get("/updates", async (req, res) => {
  const updates = await CommunityUpdate.find().sort({ timestamp: -1 });
  res.json(updates);
});

// 5. Emergency Contacts (Add & Search)
app.post("/contacts", async (req, res) => {
  const { name, number, address, agency } = req.body;
  const newContact = new EmergencyContact({ name, number, address, agency });
  await newContact.save();
  res.json({ message: "Emergency contact added" });
});

app.get("/contacts", async (req, res) => {
  const { search } = req.query;
  const query = search ? { $or: [{ name: new RegExp(search, "i") }, { agency: new RegExp(search, "i") }] } : {};
  const contacts = await EmergencyContact.find(query);
  res.json(contacts);
});

// 6. Send Telegram Alert for Missing Person
app.post("/send-telegram-alert", async (req, res) => {
  const { name, location } = req.body;

  if (!name || !location) {
    return res.status(400).json({ error: "Name and location are required" });
  }

  const message = `🚨 *Missing Person Alert* 🚨\n👤 *Name:* ${name}\n📍 *Last Seen:* ${location}\n📞 *Contact Authorities if found!*`;

  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, message, { parse_mode: "Markdown" });
    res.json({ message: "Alert sent successfully on Telegram!" });
  } catch (error) {
    console.error("❌ Error sending Telegram message:", error);
    res.status(500).json({ error: "Failed to send alert" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
