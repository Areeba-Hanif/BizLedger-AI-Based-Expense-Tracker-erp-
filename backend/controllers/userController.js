import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import twilio from "twilio";

console.log("SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("AUTH:", process.env.TWILIO_AUTH_TOKEN);
console.log("SERVICE:", process.env.TWILIO_SERVICE_SID);

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ✅ STEP 1: Send OTP to user's phone number
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    console.log("📩 Sending OTP to:", phone);

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const verification = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications
      .create({ to: phone, channel: "sms" });

    console.log("✅ Twilio Verify Response:", verification);

    res.status(200).json({ message: "OTP sent!" });
  } catch (error) {
    console.error("🔥 Twilio Error:", error);
    res.status(500).json({ message: error?.message || "Twilio error" });
  }
};


// ✅ STEP 2: Verify OTP and reset password
export const verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: phone, code: otp });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register new user
// @route   POST /api/users/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password , phone} = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingPhone = await User.findOne({ phone });
if (existingPhone) return res.status(400).json({ message: "Phone already in use" });
    // Create user
    const newUser = await User.create({
      name,
      email,
       phone,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
