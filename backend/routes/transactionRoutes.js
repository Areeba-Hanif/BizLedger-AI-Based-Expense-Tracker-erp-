import express from "express";
import {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} from "../controllers/transactionController.js";

const router = express.Router();

// ✅ Routes
router.get("/:userId", getTransactions);
router.post("/add", addTransaction);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
