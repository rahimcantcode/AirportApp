import express from "express";
import cors from "cors";
import { apiRouter } from "./routes/api.js";
import { authRouter } from "./routes/auth.js";
import { ApiError } from "./utils/errors.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.send("Backend is running");
});

// Example API route
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from backend" });
});

app.use("/api", apiRouter);
app.use("/api/auth", authRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  const message = err instanceof Error ? err.message : "Unexpected server error";
  return res.status(500).json({ error: message });
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
