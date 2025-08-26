// server.js
require("dotenv").config(); // Load .env first

const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1); // stop server if URI is missing
}

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Repo Schema
const RepoSchema = new mongoose.Schema({
  name: String,
  owner: String,
  stars: Number,
  url: String,
  description: String,
  searchedAt: { type: Date, default: Date.now },
});

const Repo = mongoose.model("Repo", RepoSchema);

// Root route
app.get("/", (req, res) => {
  res.send("🚀 API is running! Use POST /search or GET /results");
});

// POST /search -> fetch repos from GitHub & save to DB
app.post("/search", async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    const response = await axios.get(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(
        keyword
      )}&per_page=10`
    );

    const repos = response.data.items.map((r) => ({
      name: r.name,
      owner: r.owner.login,
      stars: r.stargazers_count,
      url: r.html_url,
      description: r.description,
    }));

    // Save repos to DB
    await Repo.insertMany(repos);

    res.json(repos);
  } catch (error) {
    console.error("❌ GitHub API error:", error.message);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// GET /results -> fetch saved repos (paginated)
app.get("/results", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const results = await Repo.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ searchedAt: -1 }); // latest first

    res.json(results);
  } catch (error) {
    console.error("❌ Database error:", error.message);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
