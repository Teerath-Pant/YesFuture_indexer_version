import express from "express";
import cors from "cors";
import { usersRouter } from "./routes/users.js";
import { teamRouter } from "./routes/team.js";
import { systemRouter } from "./routes/system.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { incomeRouter } from "./routes/income.js";
import { transactionsRouter } from "./routes/transactions.js";

export const app = express();
app.use(cors()); // frontend (Vite dev server, different port) calls this API from the browser
app.use(express.json());

// Several columns (blockNumber, cycle, directPartners, totalTeam, ...) are
// drizzle bigint-mode columns — JSON.stringify throws on a raw BigInt.
// Fixed globally here instead of stringifying at every call site.
app.set("json replacer", (_key: string, value: unknown) =>
  typeof value === "bigint" ? value.toString() : value,
);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/users", usersRouter);
app.use("/team", teamRouter);
app.use("/system", systemRouter);
app.use("/dashboard", dashboardRouter);
app.use("/income", incomeRouter);
app.use("/transactions", transactionsRouter);
