const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const busServicesUpload = require("../middlewares/busServicesUpload");
const {
  createBusService,
  getBusServices,
  updateBusService,
  deleteBusService,
} = require("../controllers/busServices.controller");
const editorMiddleware = require("../middlewares/editor.middleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  editorMiddleware,
  busServicesUpload.single("busImage"),
  createBusService
);

router.get(
  "/",
  getBusServices
);

router.patch(
  "/:serviceId",
  authMiddleware,
  editorMiddleware,
  busServicesUpload.single("busImage"),
  updateBusService
);

router.delete(
  "/:serviceId",
  authMiddleware,
  adminMiddleware,
  deleteBusService
);

module.exports = router;
