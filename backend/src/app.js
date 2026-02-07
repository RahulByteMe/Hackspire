import express from "express";
import cors from "cors";

import otpRoutes from "./routes/verification.routes.js";

const app = express();

// Middlewares
app.use(cors({
  origin: "http://localhost:5173", // your frontend
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health route
app.get("/", (req, res) => {
  res.json({ message: "Backend running 🚀" });
});

// Routes
app.use("/api/otp", otpRoutes);

export default app;
