import 'dotenv/config';
import express from "express";

import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

connectDB(process.env.MONGO_URI);

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => res.send("AI Task Assistant Backend Running"));

app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port:", process.env.PORT || 5000)
);