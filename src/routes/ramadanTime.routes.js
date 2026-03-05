const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
const {
  getRamadanTable,
  updateRamadanTable,
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

module.exports = router;
