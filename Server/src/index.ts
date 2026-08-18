import "dotenv/config";
import { app } from "./api/app.js";
import { runIndexerLoop } from "./chain/indexer.js";

const port = Number(process.env.PORT ?? 4000);

// Express 4 doesn't forward a rejected async route handler to error middleware
// — it becomes an unhandled rejection, and Node kills the whole process on
// those by default. One bad query/param in any route was taking down the
// entire API (and the indexer loop with it). Log instead of dying.
process.on("unhandledRejection", (err) => {
  console.error("unhandled rejection (route probably threw):", err);
});

app.listen(port, () => console.log(`api listening on :${port}`));

runIndexerLoop().catch((err) => {
  console.error("indexer loop crashed:", err);
  process.exit(1);
});
