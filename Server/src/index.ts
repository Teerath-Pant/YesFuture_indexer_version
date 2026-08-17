import "dotenv/config";
import { app } from "./api/app.js";
import { runIndexerLoop } from "./chain/indexer.js";

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => console.log(`api listening on :${port}`));

runIndexerLoop().catch((err) => {
  console.error("indexer loop crashed:", err);
  process.exit(1);
});
