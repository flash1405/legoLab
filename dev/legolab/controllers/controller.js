const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const fetch = require("node-fetch");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET; // Replace with a secure secret

// Sign-up function
exports.signup = async (req, res) => {
  const { username, password, user_email, user_age } = req.body;

  if (!username || !password || !user_email || !user_age) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // await db.beginTransaction();
    await db.query(
      `INSERT INTO USERS (user_id, username, password, user_email, user_age) VALUES (UUID(), ?, ?, ?, ?)`,
      [username, hashedPassword, user_email, user_age]
    );
    // await db.commit();

    res.status(201).json({ message: "User created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating user" });
  }
};

// Login function
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [user] = await db.query("SELECT * FROM USERS WHERE username = ?", [
      username,
    ]);

    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(user[0], JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Login successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
};

exports.dashboard = async (req, res) => {
  const { user_id, username, user_email, user_age } = req.session.user;
  try {
    // Fetch user inventory from the database
    const query = `
          SELECT P.part_id, P.part_name, P.part_color, P.part_png, I.part_quantity 
          FROM INVENTORY I 
          JOIN PARTS P ON I.part_id = P.part_id AND I.part_color = P.part_color
          WHERE I.user_id = ?;
      `;
    const [results] = await db.query(query, user_id);
    res.render("dashboard", { username, inventory: results });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error");
  }
};
exports.allParts = async (req, res) => {
  const { page = 1, name = "", color = "" } = req.query; // Default page is 1
  const limit = 20; // Number of parts per page
  const offset = (parseInt(page, 10) - 1) * limit;

  try {
    // Query for filtered and paginated parts
    const query = `
          SELECT part_id, part_name, part_color, part_png, part_dimensions FROM parts 
          WHERE part_name LIKE ? AND part_color LIKE ?
          LIMIT ${limit} OFFSET ${offset}
      `;
    const [results] = await db.execute(query, [`%${name}%`, `%${color}%`]);
    // Get total count for pagination
    const countQuery = `
          SELECT COUNT(*) as total
          FROM parts
          WHERE part_name LIKE ? AND part_color LIKE ?
      `;
    const [countResult] = await db.execute(countQuery, [
      `%${name}%`,
      `%${color}%`,
    ]);

    res.json({
      parts: results,
      total: countResult[0].total,
      page: parseInt(page),
      pages: Math.ceil(countResult[0].total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getPartId = async (req, res) => {
  const apiUrl = "https://api.brickognize.com/predict/parts";
  const imageFile = req.file.buffer;
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: imageFile,
    });

    if (response.ok) {
      const data = await response.json();
      res.json(data); // Return the API response
    } else {
      res.status(500).json({ error: "Failed to process image" });
    }
  } catch (error) {
    console.error("Error in part image recognition:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addToInventory = async (req, res) => {
  const user_id = req.session.user.user_id;
  const { part_id, part_color, part_quantity } = req.body;
  const query = `
      INSERT INTO INVENTORY (user_id, part_id, part_color, part_quantity)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE part_quantity = part_quantity + ?;
  `;
  try {
    // await db.beginTransaction();
    await db.query(query, [
      user_id,
      part_id,
      part_color,
      part_quantity,
      part_quantity,
    ]);
    // await db.commit();
    res.status(200).json({ message: "Part added to inventory successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add part to inventory" });
  }
};

exports.uploadToBrickognize = async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("query_image", req.files.image.data, req.files.image.name);

    const response = await axios.post(
      "https://api.brickognize.com/predict/parts",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          accept: "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getColors = async (req, res) => {
  try {
    const query = "SELECT DISTINCT part_color FROM parts";
    const [results] = await db.query(query);
    const colors = results.map((row) => row.part_color); // Extract colors
    res.json({ colors });
  } catch (error) {
    console.error("Error fetching colors:", error);
    res.status(500).json({ error: "Failed to fetch colors" });
  }
};

exports.favorite = async (req, res) => {
  const { part_id, part_color } = req.query;
  const userId = req.session.user.user_id; // Assuming user is authenticated
  try {
    // You might have a separate table for favorites or simply mark a flag on the inventory table
    const query = `
            INSERT INTO favorites (user_id, part_id, part_color) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE part_color = VALUES(part_color)
        `;
    await db.query(query, [userId, part_id, part_color]);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error favoriting part:", error);
    res.status(500).json({ error: "Failed to favorite part" });
  }
};

exports.deletePart = async (req, res) => {
  const { part_id, part_color } = req.query;
  const userId = req.session.user.user_id; // Assuming user is authenticated
  try {
    const query =
      "DELETE FROM inventory WHERE user_id = ? AND part_id = ? AND part_color = ?";
    await db.query(query, [userId, part_id, part_color]);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting part:", error);
    res.status(500).json({ error: "Failed to delete part" });
  }
};

exports.allBuilds = async (req, res) => {
  const { page = 1, name = "", theme = "" } = req.query;

  try {
    const limit = 10; // Number of builds per page
    const offset = (parseInt(page, 10) - 1) * limit;

    const sql = `
      SELECT b.build_id, b.build_name, b.build_png, b.build_rating, 
      b.build_release_year, b.build_age_rating, b.build_link,
      GROUP_CONCAT(t.theme_name) AS themes
      FROM builds b
      LEFT JOIN build_has_theme bht ON b.build_id = bht.build_id
      LEFT JOIN themes t ON bht.theme_id = t.theme_id
      WHERE (b.build_name LIKE ?)
        AND (t.theme_name LIKE ?)
      GROUP BY b.build_id
      ORDER BY b.build_name
      LIMIT ${limit} OFFSET ${offset};
    `;

    const params = [`%${name}%`, `%${theme}%`];
    const [builds] = await db.execute(sql, params);

    // Get total number of builds for pagination
    const totalQuery = `
        SELECT COUNT(*) AS total 
        FROM builds b
        LEFT JOIN build_has_theme bht ON b.build_id = bht.build_id
        LEFT JOIN themes t ON bht.theme_id = t.theme_id
        WHERE b.build_name LIKE ? AND t.theme_name LIKE ?
      `;
    const totalResult = await db.query(totalQuery, [`%${name}%`, `%${theme}%`]);
    const totalBuilds = totalResult[0][0].total;
    const totalPages = Math.ceil(totalBuilds / limit);
    res.json({
      builds,
      total: totalBuilds,
      page: parseInt(page),
      pages: totalPages,
    });
  } catch (error) {
    console.error("Error fetching builds:", error);
    res.status(500).json({ error: "Failed to fetch builds" });
  }
};

exports.buildDetails = async (req, res) => {
  const buildId = req.params.id;

  try {
    const query = `
        SELECT * FROM builds WHERE id = ?
      `;
    const build = await db.query(query, [buildId]);

    if (build.length === 0) {
      return res.status(404).json({ error: "Build not found" });
    }

    res.json(build[0]);
  } catch (error) {
    console.error("Error fetching build details:", error);
    res.status(500).json({ error: "Failed to fetch build details" });
  }
};

exports.getThemes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT DISTINCT theme_name FROM themes");
    const themes = rows.map((row) => row.theme_name);
    res.json({ themes });
  } catch (error) {
    console.error("Error fetching themes:", error);
    res.status(500).json({ error: "Failed to fetch themes" });
  }
};

exports.setActiveBuild = async (req, res) => {
  const { build_id } = req.query;
  const user_id = req.session.user.user_id;
  try {
    await db.query("UPDATE users SET current_build_id = ? WHERE user_id = ?", [
      build_id,
      user_id,
    ]);
    res.status(200).json({ message: "Active build set successfully" });
  } catch (error) {
    console.error("Error setting active build:", error);
    res.status(500).json({ error: "Failed to set active build" });
  }
};

exports.getActiveBuild = async (req, res) => {
  const user_id = req.session.user.user_id;
  try {
    const connection = await db.getConnection(); // Assume db.getConnection() is your connection pool

    // Call the stored procedure
    const [result] = await connection.query("CALL GetBuildDetails(?)", [
      user_id,
    ]);

    // Result will contain multiple result sets
    const buildDetails = result[0][0]; // Active build details
    const requiredParts = result[1]; // Required parts for the build
    const userInventory = result[2]; // User's inventory parts
    const missingParts = result[3]; // Missing parts and lowest prices

    // Calculate total cost
    let totalCost = 0;
    missingParts.forEach((part) => {
      totalCost += part.lowest_price * part.required_quantity;
    });

    res.json({
      buildDetails,
      requiredParts,
      userInventory,
      missingParts,
      totalCost,
    });
  } catch (error) {
    console.error("Error fetching active build details:", error);
    res.status(500).json({ error: "Failed to fetch active build details" });
  }
};
