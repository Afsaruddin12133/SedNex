const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createTouristSpot,
  getTouristSpots,
  getTouristSpotById,
  updateTouristSpot,
  deleteTouristSpot,
} = require("../controllers/tourist.controller");
const touristUpload = require("../middlewares/touristUpload");
const adminMiddleware = require("../middlewares/admin.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  touristUpload.single("image"),
  createTouristSpot
);

router.get(
  "/",
  authMiddleware,
  getTouristSpots
);

router.get(
  "/:touristId",
  authMiddleware,
  getTouristSpotById
);

router.patch(
  "/:touristId",
  authMiddleware,
  touristUpload.single("image"),
  updateTouristSpot
);

router.delete(
  "/:touristId",
  authMiddleware,
  adminMiddleware,
  deleteTouristSpot
);

module.exports = router;
