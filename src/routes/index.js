const express = require("express");
const authRoutes = require("./auth.routes");
const usersRoutes = require("./user.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);

module.exports = router;
