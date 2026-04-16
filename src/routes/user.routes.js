const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const editorMiddleware = require("../middlewares/editor.middleware");
const userProfileUpdateMiddleware = require("../middlewares/userProfileUpdate.middleware");
const {
  getMyProfile,
  updateUserRole,
  updateUserProfile,
  updateUserPasswordByAdmin,
  deleteUser,
  getAllUsers,
  createUserWarning,
  getUserWarnings,
  updateUserWarning,
  deleteUserWarning,
} = require("../controllers/user.controller");
const upload = require("../middlewares/upload");

const router = express.Router();

// Get My Profile...
router.get(
  "/me",
  authMiddleware,
  getMyProfile
);

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

// Update User Password (Admin/Editor)...
router.patch(
  "/:userId/password",
  authMiddleware,
  editorMiddleware,
  updateUserPasswordByAdmin
);

// Delete User...
router.delete(
  "/:userId",
  authMiddleware,
  adminMiddleware,
  deleteUser
);

module.exports = router;
