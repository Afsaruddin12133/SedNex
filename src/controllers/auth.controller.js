const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const admin = require("../config/firebaseAdmin");
const User = require("../models/User");

const register = async (req, res) => {
  try {
    const { fullName, email, country, password } = req.body;

    if (!fullName) {
      return res.status(400).json({
        message: "fullName is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "email is required",
      });
    }

    if (!country) {
      return res.status(400).json({
        message: "country is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "password is required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered kindly login instead",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: fullName,
      email,
      country,
      password: hashedPassword,
      role: "user",
      provider: "local",
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).json({
      message: "Registration successful"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "password is required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Wrong Email" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Wrong password" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "token is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        message: "newPassword is required",
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        message: "confirmPassword is required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Password reset failed",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetPasswordOtp = otpHash;
    user.resetPasswordOtpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    const requiredEnv = [
      process.env.SMTP_HOST,
      process.env.SMTP_PORT,
      process.env.SMTP_USER,
      process.env.SMTP_PASS,
      process.env.EMAIL_FROM,
      process.env.RESET_PASSWORD_URL,
    ];

    if (requiredEnv.some((value) => !value)) {
      return res.status(500).json({
        message: "Email configuration is missing",
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your password reset OTP",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });

    return res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send reset email",
      error: error.message,
    });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "email is required",
      });
    }

    if (!otp) {
      return res.status(400).json({
        message: "otp is required",
      });
    }

    const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordOtp: otpHash,
      resetPasswordOtpExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "OTP verified",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: "token is required",
      });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    const provider = decoded?.firebase?.sign_in_provider || "google";

    if (!decoded?.email) {
      return res.status(400).json({
        message: "Invalid token payload",
      });
    }

    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      user = await User.create({
        name: null,
        email: decoded.email,
        role: "user",
        country: null,  
        provider,
      });
    } else if (!user.provider) {
      user.provider = provider;
      await user.save();
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const appToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      message: "Google login successful",
      token: appToken,
      user: userResponse,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Google login failed",
      error: error.message,
    });
  }
};

module.exports = { login, register, resetPassword, forgotPassword, verifyResetOtp, googleLogin };
