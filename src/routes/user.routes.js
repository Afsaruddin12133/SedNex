const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const userProfileUpdateMiddleware = require("../middlewares/userProfileUpdate.middleware");
const {
  updateUserRole,
  updateUserProfile,
  deleteUser,
  getAllUsers,
  createUserWarning,
  getUserWarnings,
  updateUserWarning,
  deleteUserWarning,
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

// Warnings (Admin Only)...
router.post(
  "/:userId/warnings",
  authMiddleware,
  adminMiddleware,
  createUserWarning
);

router.get(
  "/:userId/warnings",
  authMiddleware,
  getUserWarnings
);

router.patch(
  "/:userId/warnings/:warningId",
  authMiddleware,
  adminMiddleware,
  updateUserWarning
);

router.delete(
  "/:userId/warnings/:warningId",
  authMiddleware,
  adminMiddleware,
  deleteUserWarning
);

// Update Users...
router.patch(
  "/:userId",
  authMiddleware,
  userProfileUpdateMiddleware,
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
