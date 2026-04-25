const bcrypt = require("bcrypt");
const User = require("../models/User");

// =======================
// Get My Profile (User)
// =======================
const getMyProfile = async (req, res) => {
  try {
    const userId = req.authUser && req.authUser.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

// =======================
// Get All Users (Admin)
// =======================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// =======================
// Update User Role (Admin Only)
// =======================
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

  
    const allowedRoles = ["user", "admin", "editor"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    if (req.authUser.userId.toString() === userId) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update role",
    });
  }
};

// =======================
// Delete User (Admin Only)
// =======================
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.authUser.userId.toString() === userId) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// =======================
// Update User Info
// =======================

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const updates = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updates, "isVerified")) {
      const rawValue = updates.isVerified;
      let normalizedValue;

      if (typeof rawValue === "boolean") {
        normalizedValue = rawValue;
      } else if (typeof rawValue === "number") {
        if (rawValue === 1) normalizedValue = true;
        if (rawValue === 0) normalizedValue = false;
      } else if (typeof rawValue === "string") {
        const normalized = rawValue.trim().toLowerCase();

        if (["true", "1", "yes", "on"].includes(normalized)) {
          normalizedValue = true;
        }

        if (["false", "0", "no", "off"].includes(normalized)) {
          normalizedValue = false;
        }
      }

      if (typeof normalizedValue === "undefined") {
        return res.status(400).json({
          message: "isVerified must be true or false",
        });
      }

      updates.isVerified = normalizedValue;
    }

    if (req.file) {
      updates.profileImage = req.file.path;
    }

    delete updates._id;
    delete updates.__v;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// =======================
// Update User Password (Admin/Editor)
// =======================
const updateUserPasswordByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "newPassword is required" });
    }

    if (!confirmPassword) {
      return res.status(400).json({ message: "confirmPassword is required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user password",
    });
  }
};

// =======================
// Create User Warning (Admin Only)
// =======================
const createUserWarning = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Warning message is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const warning = {
      message: message.trim(),
      createdBy: req.authUser.userId,
    };

    user.warnings.push(warning);
    await user.save();

    const createdWarning = user.warnings[user.warnings.length - 1];

    res.status(201).json({
      success: true,
      message: "Warning created successfully",
      warning: createdWarning,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create warning",
    });
  }
};

// =======================
// Get User Warnings (Admin Only)
// =======================
const getUserWarnings = async (req, res) => {
  try {
    const { userId } = req.params;

    const isAdmin = req.authUser && req.authUser.role === "admin";
    const isOwner = req.authUser && req.authUser.userId.toString() === userId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(userId, { warnings: 1 });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      total: user.warnings.length,
      warnings: user.warnings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch warnings",
    });
  }
};

// =======================
// Update User Warning (Admin Only)
// =======================
const updateUserWarning = async (req, res) => {
  try {
    const { userId, warningId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Warning message is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const warning = user.warnings.id(warningId);

    if (!warning) {
      return res.status(404).json({ message: "Warning not found" });
    }

    warning.message = message.trim();
    warning.updatedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Warning updated successfully",
      warning,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update warning",
    });
  }
};

// =======================
// Delete User Warning (Admin Only)
// =======================
const deleteUserWarning = async (req, res) => {
  try {
    const { userId, warningId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const warning = user.warnings.id(warningId);

    if (!warning) {
      return res.status(404).json({ message: "Warning not found" });
    }

    warning.deleteOne();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Warning deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete warning",
    });
  }
};


module.exports = {
  getMyProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateUserProfile,
  updateUserPasswordByAdmin,
  createUserWarning,
  getUserWarnings,
  updateUserWarning,
  deleteUserWarning,
};
