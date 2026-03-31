const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const {
	login,
	register,
	resetPassword,
	changePassword,
	forgotPassword,
	verifyResetOtp,
	googleLogin,
	facebookLogin,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", login);
router.post("/signin", register);
router.post("/google-login", googleLogin);
router.post("/facebook-login", facebookLogin);
router.post("/forgot-password", forgotPassword);
router.post("/otp-verification", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post("/change-password", authMiddleware, changePassword);




module.exports = router;
