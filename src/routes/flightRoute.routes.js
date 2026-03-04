const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
const {
  createFlightRoute,
  getFlightRoutes,
  updateFlightRoute,
  deleteFlightRoute,
} = require("../controllers/flightRoute.controller");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  editorMiddleware,
  createFlightRoute
);

router.get(
  "/",
  getFlightRoutes
);

router.patch(
  "/:routeId",
  authMiddleware,
  editorMiddleware,
  updateFlightRoute
);

router.delete(
  "/:routeId",
  authMiddleware,
  adminMiddleware,
  deleteFlightRoute
);

module.exports = router;
