const express = require("express");
const {
	login,
	register,
	resetPassword,
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


module.exports = router;
