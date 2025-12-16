
const adminMiddleware = (req, res, next) => {
  if (!req.authUser) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }
  if (req.authUser.role !== "admin") {
    return res.status(403).json({
      message: "Admin access only",
    });
  }
  next();
};

module.exports = adminMiddleware;
