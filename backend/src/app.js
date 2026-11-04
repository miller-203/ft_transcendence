import express from "express";

const app = express();

// Parse JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running",
  });
});

//Hundle 404 error status not found
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Page not found",
  });
});

export default app;
