import Transaction from "../models/transactionModel.js";

// ✅ Add Transaction
export const addTransaction = async (req, res) => {
  try {
    const { userId, type, amount, description, category, date } = req.body;

    const newTransaction = await Transaction.create({
      userId,
      type,
      amount,
      description,
      category,
      date,
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all transactions of a user
export const getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.status(200).json(transactions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const { amount, description, category, date, type } = req.body;

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { amount, description, category, date, type },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(updated);

  } catch (error) {
    res.status(500).json({ 
      message: "Update failed", 
      error: error.message 
    });
  }
};
