const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const {
  updateUserRole,
  updateUserProfile,
  deleteUser,
  getAllUsers,
} = require("../controllers/user.controller");
const upload = require("../middlewares/upload");

const router = express.Router();

// Get Users...
router.get(
  "/", 
  authMiddleware, 
  getAllUsers
);

// Role Update...
router.patch(
  "/:userId/role",
  authMiddleware,
  adminMiddleware,
  updateUserRole
);

// Update Users...
router.patch(
  "/:userId",
  authMiddleware,
  upload.single("profileImage"),
  updateUserProfile
);

// Delete User...
router.delete(
  "/:userId",
  authMiddleware,
  adminMiddleware,
  deleteUser
);

module.exports = router;
