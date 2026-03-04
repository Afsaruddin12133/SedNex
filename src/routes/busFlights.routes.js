const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
const busFlightsUpload = require("../middlewares/busFlightsUpload");
const { createFlightdetails } = require("../controllers/busFlights.controller");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  editorMiddleware,
  busFlightsUpload.single("airlineImage"),
  createFlightdetails
);

module.exports = router;