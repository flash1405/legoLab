const db = require("../config/db");

// Get all themes
const getThemes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM themes");
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a theme by ID
const getThemeById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM themes WHERE theme_id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      res.status(404).json({ message: "Theme not found" });
    } else {
      res.status(200).json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getThemes, getThemeById };
