const express = require("express");
const { getThemes, getThemeById } = require("./controller");

const router = express.Router();

router.get("/themes", getThemes);
router.get("/themes/:id", getThemeById);

module.exports = router;
