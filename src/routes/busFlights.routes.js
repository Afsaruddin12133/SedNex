const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
const busFlightsUpload = require("../middlewares/busFlightsUpload");
const {
  createFlightdetails,
  getFlightdetails,
  updateFlightdetails,
  deleteFlightdetails,
} = require("../controllers/busFlights.controller");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  editorMiddleware,
  busFlightsUpload.single("airlineImage"),
  createFlightdetails
);

router.get(
  "/",
  getFlightdetails
);

router.patch(
  "/:flightId",
  authMiddleware,
  adminMiddleware,
  busFlightsUpload.single("airlineImage"),
  updateFlightdetails
);

router.delete(
  "/:flightId",
  authMiddleware,
  adminMiddleware,
  deleteFlightdetails
);

module.exports = router;