
import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Page not found",
  });
});

export default app;
