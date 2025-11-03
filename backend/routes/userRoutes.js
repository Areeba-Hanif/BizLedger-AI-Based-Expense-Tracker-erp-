import express from "express";
import { registerUser, loginUser, getUserProfile } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";
import { sendOtp, verifyOtpAndResetPassword } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/profile", protect, getUserProfile);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndResetPassword);


export default router;
