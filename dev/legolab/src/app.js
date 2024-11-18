const express = require("express");
const cors = require("cors");
const legoRoutes = require("./routes");
const path = require("path");
const pool = require("../config/db");

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON requests
// app.use("/api/lego", legoRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the LEGO Builder API!");
});

app.use(express.static(path.join(__dirname, "../public")));

app.get("/add-part", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.post("/add-part", async (req, res) => {
  const { user_id, part_id, part_color, part_quantity } = req.body;

  const query = `
      INSERT INTO INVENTORY (user_id, part_id, part_color, part_quantity)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE part_quantity = part_quantity + VALUES(part_quantity);
    `;

  try {
    await pool.query(query, [user_id, part_id, part_color, part_quantity]);
    res.status(200).json({ message: "Part added to inventory successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add part to inventory" });
  }
});

module.exports = app;
