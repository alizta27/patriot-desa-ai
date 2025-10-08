import express from "express";
import cors from "cors";
import { db } from "./db";
import { chatRoutes } from "./routes/chat";
import { subscriptionRoutes } from "./routes/subscription";
import { webhookRoutes } from "./routes/webhook";
import { adminRoutes } from "./routes/admin";
import { profileRoutes } from "./routes/profile";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Routes
app.use("/api/chat", chatRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
