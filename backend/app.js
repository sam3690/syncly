const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "syncly-backend" });
});

app.get("/api/v1/info", (req, res) => {
  res.json({
    name: "Syncly API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

const domain = process.env.AUTH0_DOMAIN;
const audience = process.env.AUTH0_AUDIENCE;

const requireAuth = jwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://${domain}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
  }),
  audience: audience,
  issuer: `https://${domain}/`,
  algorithms: ["RS256"],
});

app.get("/secure/ping", requireAuth, (req, res) => {
  res.json({
    ok: true,
    user: req.auth,
  });
});

app.listen(PORT, () => {
  console.log(`Syncly backend listening on port ${PORT}`);
});
