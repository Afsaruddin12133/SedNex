const User = require("../models/User");
const admin = require("../config/firebaseAdmin");

const loginOrRegister = async (req, res) => {
  try {
    const { token } = req.body;

    console.log(token);
    

    const decoded = await admin.auth().verifyIdToken(token);

    let user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name || "Guest User",
        email: decoded.email,
        photo: decoded.picture,
        provider: decoded.firebase.sign_in_provider,
        role: "user",
      });
    }

    return res.status(200).json({
      message: "Authentication successful",
      user,
    });
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = { loginOrRegister };
