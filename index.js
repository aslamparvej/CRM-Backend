import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import leadRoutes from "./routes/lead.routes.js";
import followUpRoutes from "./routes/followup.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import leadStatusRoutes from "./routes/leadStatus.routes.js";
import activityRoutes from "./routes/activity.routes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Server working" });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/followups", followUpRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/statuses", leadStatusRoutes);

app.use("/api/activities", activityRoutes);

const PORT = process.env.PORT || 5000;
// Create a server
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, async () => {
  await connectDB();
  console.log(
    `Server running on PORT: ${PORT} and connected to DB on ${process.env.NODE_ENV} mode`,
  );
});

// app.listen(PORT, () => {
//   connectDB();
//   console.log(
//     `Server running on PORT: ${PORT} and connected to DB on ${process.env.NODE_ENV} mode`,
//   );
// });
