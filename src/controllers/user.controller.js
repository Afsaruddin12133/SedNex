const User = require("../models/User");

const updateUserRole = async (req, res) => {
  
  try {
    const { userId } = req.params;
    const { role } = req.body;
  
    // Only allowed roles
    const allowedRoles = ["user", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    console.log(userId);
    

    // Prevent admin from changing own role (optional but recommended)
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

    return res.status(200).json({
      message: "User role updated successfully",
      user,
    });

  } catch (error) {
    return res.status(500).json({ message: "Failed to update role" });
  }
};

module.exports = { updateUserRole };
