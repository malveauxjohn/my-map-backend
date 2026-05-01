const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Connect to PostgreSQL (Render auto provides DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ✅ Create table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name TEXT,
    category TEXT,
    description TEXT,
    lat FLOAT,
    lng FLOAT
  );
`);

// 📥 GET all locations
app.get("/locations", async (req, res) => {
  const result = await pool.query("SELECT * FROM locations");
  res.json(result.rows);
});

// ➕ ADD location
app.post("/locations", async (req, res) => {
  const { name, category, description, lat, lng } = req.body;

  const result = await pool.query(
    "INSERT INTO locations (name, category, description, lat, lng) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [name, category, description, lat, lng]
  );

  res.json(result.rows[0]);
});

// ✏️ UPDATE location
app.put("/locations/:id", async (req, res) => {
  const { id } = req.params;
  const { name, category, description, lat, lng } = req.body;

  await pool.query(
    "UPDATE locations SET name=$1, category=$2, description=$3, lat=$4, lng=$5 WHERE id=$6",
    [name, category, description, lat, lng, id]
  );

  res.sendStatus(200);
});

// 🗑 DELETE location
app.delete("/locations/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM locations WHERE id=$1", [id]);

  res.sendStatus(200);
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});