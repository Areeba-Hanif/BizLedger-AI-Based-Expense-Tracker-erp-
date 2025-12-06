import express from "express";
import { getMonthlyReport } from "../controllers/reportController.js";

const router = express.Router();

// Example:
// /api/reports/monthly?userId=123&month=0&year=2025
router.get("/monthly", getMonthlyReport);

export default router;
