const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Database
const db = new Database("locations.db");

// Create table
db.prepare(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    description TEXT,
    lat REAL,
    lng REAL
  )
`).run();

// =====================
// ROUTES
// =====================

// GET all locations
app.get("/locations", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM locations").all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// ADD location
app.post("/locations", (req, res) => {
  try {
    const { name, category, description, lat, lng } = req.body;

    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = db
      .prepare(
        "INSERT INTO locations (name, category, description, lat, lng) VALUES (?, ?, ?, ?, ?)"
      )
      .run(name, category, description, lat, lng);

    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

// UPDATE location
app.put("/locations/:id", (req, res) => {
  try {
    const { name, category, description, lat, lng } = req.body;

    const result = db
      .prepare(
        "UPDATE locations SET name=?, category=?, description=?, lat=?, lng=? WHERE id=?"
      )
      .run(name, category, description, lat, lng, req.params.id);

    res.json({ updated: result.changes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// DELETE location
app.delete("/locations/:id", (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM locations WHERE id=?")
      .run(req.params.id);

    res.json({ deleted: result.changes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// =====================
// START SERVER
// =====================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});