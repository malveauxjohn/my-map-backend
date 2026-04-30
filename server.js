const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const db = new sqlite3.Database("./locations.db");

db.run(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    description TEXT,
    lat REAL,
    lng REAL
  )
`);

app.get("/locations", (req, res) => {
  db.all("SELECT * FROM locations", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post("/locations", (req, res) => {
  const { name, category, description, lat, lng } = req.body;

  db.run(
    "INSERT INTO locations (name, category, description, lat, lng) VALUES (?, ?, ?, ?, ?)",
    [name, category, description, lat, lng],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

app.put("/locations/:id", (req, res) => {
  const { name, category, description, lat, lng } = req.body;

  db.run(
    "UPDATE locations SET name=?, category=?, description=?, lat=?, lng=? WHERE id=?",
    [name, category, description, lat, lng, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ updated: this.changes });
    }
  );
});

app.delete("/locations/:id", (req, res) => {
  db.run("DELETE FROM locations WHERE id=?", req.params.id, function (err) {
    if (err) return res.status(500).json(err);
    res.json({ deleted: this.changes });
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});