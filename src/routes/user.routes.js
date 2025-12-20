const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const { updateUserRole, updateUserProfile } = require("../controllers/user.controller");
const { getAllUsers } = require("../controllers/user.controller");
const { default: upload } = require("../middlewares/upload");

const router = express.Router();

// Get Users...
router.get(
  "/", 
  authMiddleware, 
  adminMiddleware,
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
  "/:firebaseUid",
  authMiddleware,  
  upload.single("profileImage"),
  updateUserProfile
);

module.exports = router;
