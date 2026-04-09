import express from "express";
import axios from "axios";
import Transaction from "../models/transactionModel.js";

const router = express.Router();

// 1. Prediction Route (Connects to Port 8000 for Expenses)
router.post("/predict", async (req, res) => {
  try {
    const { description, type } = req.body;

    // --- STRICT INCOME LOGIC ---
    if (type === "income") {
      const desc = description.toLowerCase();
      let predictedCategory = "Other Income";

      // Match against your specific Income Categories
      if (desc.includes("sale") || desc.includes("product") || desc.includes("revenue")) {
        predictedCategory = "Sales";
      } else if (desc.includes("service") || desc.includes("freelance") || desc.includes("project") || desc.includes("work")) {
        predictedCategory = "Services"; // "Freelance project" will now hit this
      } else if (desc.includes("consult") || desc.includes("advice") || desc.includes("meeting")) {
        predictedCategory = "Consulting";
      } else if (desc.includes("interest") || desc.includes("bank") || desc.includes("dividend")) {
        predictedCategory = "Interest";
      }

      // We use 'return' to stop execution so it doesn't call the Expense AI
      return res.json({ predictedCategory, source: "income_engine" });
    }

    // --- EXPENSE AI (Port 8000) ---
    // This only runs if type is NOT "income"
    const response = await axios.post(
      "http://127.0.0.1:8000/predict-category",
      req.body
    );
    res.json(response.data);

  } catch (error) {
    console.error("Predict Service Error:", error.message);
    res.status(500).json({ error: "AI Prediction failed" });
  }
});

// 2. Monthly Summary Route (Connects to Port 8001)
router.get("/get-monthly-summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch transactions from MongoDB for this specific user
    const transactions = await Transaction.find({ userId });

    // Send the transactions to Python 
    const aiRes = await axios.post("http://127.0.0.1:8001/monthly-summary", {
      transactions: transactions 
    });

    // Return the text summary to the frontend
    res.json(aiRes.data);
  } catch (error) {
    console.error("Insights Service Error:", error.message);
    res.status(500).json({ error: "Failed to generate monthly summary. Check if insights.py is running." });
  }
});

export default router;