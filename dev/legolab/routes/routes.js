const express = require("express");
const router = express.Router();
const userController = require("../controllers/controller");
const auth = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/api/users/signup", userController.signup);
router.post("/api/users/login", userController.login);
router.get("/dashboard", auth.authenticateJWT, userController.dashboard);
router.get("/api/all-parts", auth.authenticateJWT, userController.allParts);
router.post(
  "/api/get-part-id",
  auth.authenticateJWT,
  upload.single("query_image"),
  userController.getPartId
);
router.post(
  "/api/add-to-inventory",
  auth.authenticateJWT,
  userController.addToInventory
);

router.post("/api/upload-to-brickognize", userController.uploadToBrickognize);
router.get("/api/get-colors", userController.getColors);

// Route to toggle favorite for a part
router.post("/api/favorite", auth.authenticateJWT, userController.favorite);

// Route to delete a part from the user's inventory
router.delete("/api/delete", auth.authenticateJWT, userController.deletePart);

// Fetch all builds with pagination and filters
router.get("/api/all-builds", auth.authenticateJWT, userController.allBuilds);

router.get("/api/get-themes", auth.authenticateJWT, userController.getThemes);

router.post(
  "/api/set-active-build",
  auth.authenticateJWT,
  userController.setActiveBuild
);

router.get(
  "/api/get-active-build",
  auth.authenticateJWT,
  userController.getActiveBuild
);

module.exports = router;
