import dotenv from "dotenv";
dotenv.config();   // ✅ load .env automatically from same folder

import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);

// ✅ Check env variables load
console.log("✅ ENV CHECK:");
console.log("SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("AUTH:", process.env.TWILIO_AUTH_TOKEN);
console.log("SERVICE:", process.env.TWILIO_SERVICE_SID);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(5000, () => console.log("Server running on port 5000"));
