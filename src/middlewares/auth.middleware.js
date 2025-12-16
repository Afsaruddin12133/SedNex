const admin = require("../config/firebaseAdmin");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    
    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      return res.status(403).json({ message: "User not registered" });
    }

    req.authUser = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
      role: user.role, 
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
