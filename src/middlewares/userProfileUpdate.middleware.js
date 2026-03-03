const userProfileUpdateMiddleware = (req, res, next) => {
  if (!req.authUser) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const isOwner = req.authUser.userId.toString() === req.params.userId;
  const isPrivileged = ["admin", "editor"].includes(req.authUser.role);

  if (!isOwner && !isPrivileged) {
    return res.status(403).json({
      message: "You can only update your own profile",
    });
  }

  next();
};

module.exports = userProfileUpdateMiddleware;
