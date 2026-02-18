const express = require("express");
const { login, register, resetPassword, forgotPassword, verifyResetOtp, googleLogin } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", login);
router.post("/signin", register);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/otp-verification", verifyResetOtp);
router.post("/reset-password", resetPassword);


module.exports = router;
