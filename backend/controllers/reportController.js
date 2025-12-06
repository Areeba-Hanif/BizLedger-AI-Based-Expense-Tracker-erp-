import Transaction from "../models/transactionModel.js";

// GET Monthly Report Transactions
export const getMonthlyReport = async (req, res) => {
  try {
    const { userId, month, year } = req.query;

    if (!userId || month === undefined || !year) {
      return res.status(400).json({ message: "Missing required query params" });
    }

    const transactions = await Transaction.find({
      userId,
      date: {
        $gte: new Date(year, month, 1),
        $lt: new Date(year, Number(month) + 1, 1),
      },
    });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
