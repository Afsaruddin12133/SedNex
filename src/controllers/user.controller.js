const User = require("../models/User");

// =======================
// Get All Users (Admin)
// =======================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      {
        _id: 1,
        name: 1,
        email: 1,
        country: 1,
        role: 1,
        isActive: 1,
        profileImage: 1,
        bio: 1,
        phone: 1,
        provider: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    ).sort({ createdAt: -1 });

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

  
    const allowedRoles = ["user", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    if (req.authUser.uid.toString() === userId) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    const user = await User.findOne({ firebaseUid: userId });

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
// Update User Info
// =======================

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const updates = { ...req.body };

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


module.exports = {
  getAllUsers,
  updateUserRole,
  updateUserProfile,
};
