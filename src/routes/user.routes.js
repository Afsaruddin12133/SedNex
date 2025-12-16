const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const { updateUserRole } = require("../controllers/user.controller");

const router = express.Router();

router.patch(
  "/:userId/role",
  authMiddleware,
  adminMiddleware,
  updateUserRole
);

module.exports = router;
