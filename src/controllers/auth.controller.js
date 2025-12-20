const User = require("../models/User");
const admin = require("../config/firebaseAdmin");

const loginOrRegister = async (req, res) => {
  try {
    const { token, extraProfile } = req.body;

    const decoded = await admin.auth().verifyIdToken(token);

    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      const provider = decoded.firebase.sign_in_provider;

      const isPasswordUser = provider === "password";

      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: decoded.name || "Admin",
        photo: decoded.picture,
        provider,
        gender: isPasswordUser ? extraProfile?.gender : undefined,
        country: isPasswordUser ? extraProfile?.country : undefined,
        isProfileComplete: !isPasswordUser ? true : Boolean(extraProfile?.gender && extraProfile?.country),
        role: "admin",
      });
    }

    return res.status(200).json({
      message: "Authentication successful",
      user,
      needsProfileCompletion: !user.isProfileComplete,
    });

  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = { loginOrRegister };
