const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
const {
  getRamadanTable,
  updateRamadanTable,
  setRamadanTableStatus,
} = require("../controllers/ramadanTime.controller");

const router = express.Router();

router.get(
  "/",
  getRamadanTable
);

router.patch(
  "/",
  authMiddleware,
  editorMiddleware,
  updateRamadanTable
);

router.patch(
  "/status",
  authMiddleware,
  editorMiddleware,
  setRamadanTableStatus
);

module.exports = router;
