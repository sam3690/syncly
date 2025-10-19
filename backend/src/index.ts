import "dotenv/config";
import express from "express";
import cors from "cors";
import { requireAuth } from "./auth";
import type { Request as JWTRequest } from "express-jwt";

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:8080"], credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/secure/ping", requireAuth, (req: JWTRequest, res: express.Response) => {
  const sub = req.auth?.sub as string | undefined;  // now typed
  res.json({ ok: true, sub });
});

app.listen(PORT, () => {
  console.log(`Syncly backend listening on port ${PORT}`);
});