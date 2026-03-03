const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
const localTourUpload = require("../middlewares/localTourUpload");
const {
  createLocalTour,
  getLocalTours,
  getLocalTourById,
  updateLocalTour,
  deleteLocalTour,
} = require("../controllers/localTour.controller");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  editorMiddleware,
  localTourUpload.single("image"),
  createLocalTour
);

router.get(
  "/",
  getLocalTours
);

router.get(
  "/:tourId",
  getLocalTourById
);

router.patch(
  "/:tourId",
  authMiddleware,
  editorMiddleware,
  localTourUpload.single("image"),
  updateLocalTour
);

router.delete(
  "/:tourId",
  authMiddleware,
  adminMiddleware,
  deleteLocalTour
);

module.exports = router;
