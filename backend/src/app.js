import express from "express";
import cors from "cors";

import otpRoutes from "./routes/verification.routes.js";
import electionRoutes from "./routes/election.routes.js";
import addCandidate from "./routes/election.routes.js";

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
app.use("/api/election", electionRoutes);
app.use("/api/candidate", addCandidate);

export default app;
