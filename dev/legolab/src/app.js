const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/signUp.html"));
});

app.use(express.static(path.join(__dirname, "../frontend")));

app.post("/add-part", async (req, res) => {
  const { user_id, part_id, part_color, part_quantity } = req.body;

  const query = `
      INSERT INTO INVENTORY (user_id, part_id, part_color, part_quantity)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE part_quantity = part_quantity + VALUES(part_quantity);
    `;

  try {
    await db.query(query, [user_id, part_id, part_color, part_quantity]);
    res.status(200).json({ message: "Part added to inventory successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add part to inventory" });
  }
});

app.get("/inventory", async (req, res) => {
  const { user_id } = req.query;

  const query = `
    SELECT 
      i.part_id, 
      i.part_color, 
      i.part_quantity, 
      p.part_name, 
      p.part_png
    FROM INVENTORY i
    INNER JOIN PARTS p ON i.part_id = p.part_id AND i.part_color = p.part_color
    WHERE i.user_id = 1;
  `;

  try {
    const [rows] = await db.query(query, [user_id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

app.get("/parts", async (req, res) => {
  const query = `
      SELECT part_id, part_color, part_name, part_png, part_dimensions 
      FROM PARTS WHERE part_name LIKE "%?%" LIMIT 1000;
  `;
  try {
    const [rows] = await db.query(query, req.query.name || "a");
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch parts" });
  }
});

app.post("/inventory", async (req, res) => {
  const { user_id, part_id, part_color, part_quantity } = req.body;
  const query = `
      INSERT INTO INVENTORY (user_id, part_id, part_color, part_quantity)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE part_quantity = part_quantity + ?;
  `;
  try {
    await db.query(query, [
      user_id,
      part_id,
      part_color,
      part_quantity,
      part_quantity,
    ]);
    res.status(200).json({ message: "Part added to inventory successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add part to inventory" });
  }
});

module.exports = app;
