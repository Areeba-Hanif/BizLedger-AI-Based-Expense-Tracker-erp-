import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
