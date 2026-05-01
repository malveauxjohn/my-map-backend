import express from "express";
import pkg from "pg";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   DATABASE (PostgreSQL)
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =========================
   CLOUDINARY CONFIG
========================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "auv-map",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage });

/* =========================
   ROUTES
========================= */

// GET all locations
app.get("/locations", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM locations ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD location
app.post("/locations", async (req, res) => {
  const { name, category, description, lat, lng, image_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO locations (name, category, description, lat, lng, image_url)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [name, category, description, lat, lng, image_url || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE location
app.put("/locations/:id", async (req, res) => {
  const { id } = req.params;
  const { name, category, description, lat, lng, image_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE locations
       SET name=$1, category=$2, description=$3, lat=$4, lng=$5, image_url=$6
       WHERE id=$7
       RETURNING *`,
      [name, category, description, lat, lng, image_url || null, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE location
app.delete("/locations/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM locations WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   IMAGE UPLOAD ROUTE
========================= */
app.post("/upload", upload.single("image"), (req, res) => {
  try {
    res.json({
      imageUrl: req.file.path
    });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});