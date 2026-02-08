const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  getProfile,
  getMyEvents,
  getCreatedEvents,
  addToFavorites,
  removeFromFavorites,
  getFavorites
} = require("../controllers/userController");

router.get("/profile", authMiddleware, getProfile);
router.get("/my-events", authMiddleware, getMyEvents);
router.get("/created-events", authMiddleware, getCreatedEvents);

// FAVORITES ❤️
router.post("/favorites/:id", authMiddleware, addToFavorites);
router.delete("/favorites/:id", authMiddleware, removeFromFavorites);
router.get("/favorites", authMiddleware, getFavorites);

module.exports = router;
