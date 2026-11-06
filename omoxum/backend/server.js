require("dotenv").config();
const express = require("express");
const cors = require("cors");
const checkoutRoute = require("./routes/checkout");
const webhookRoute = require("./routes/webhook");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json({ limit: "1mb" }));

app.use("/api/checkout", checkoutRoute);
app.use("/api/webhook", webhookRoute);

app.get("/api/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`OmoxuM backend rodando em http://localhost:${PORT}`));