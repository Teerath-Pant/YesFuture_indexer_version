import "dotenv/config";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import { eq } from "drizzle-orm";
import { db, schema } from "./client.js";
import { contract, provider } from "../chain/contract.js";

const DEPLOY_BLOCK = BigInt(process.env.DEPLOY_BLOCK ?? "0");

async function seedIndexerState() {
  const existing = await db.select().from(schema.indexerState).where(eq(schema.indexerState.id, 1));
  if (existing.length) {
    console.log(`indexer_state already seeded (last_processed_block=${existing[0].lastProcessedBlock})`);
    return;
  }
  await db.insert(schema.indexerState).values({ id: 1, lastProcessedBlock: DEPLOY_BLOCK - 1n });
  console.log(`seeded indexer_state cursor at block ${DEPLOY_BLOCK - 1n}`);
}

// The genesis member (memberId=1) is written directly into contract storage by
// the constructor — it never emits UserRegistered, so the indexer never picks
// it up. Seed it here so root has a row in user_registrations/user_details/
// dashboard just like every other member.
//
// Deliberately uses memberAddress(1), NOT adminWallet(): setAdminWallet() lets
// the owner repoint the *payout* wallet at any time, but never touches
// memberId/memberStringId for the new address — memberId=1 stays permanently
// bound to whichever address the constructor was deployed with. Seeding off
// adminWallet() would silently seed the wrong "root" (memberId 0, empty
// stringId) after an admin-wallet change + DB reset, losing the real genesis
// member. memberAddress(1) is immutable, so this stays correct forever.
export async function seedRootAdmin() {
  const genesisAddress = (await contract.memberAddress(1) as string).toLowerCase();
  const memberId = await contract.memberId(genesisAddress) as bigint;
  const stringId = await contract.memberStringId(genesisAddress) as string;

  const block = await provider.getBlock(Number(DEPLOY_BLOCK)).catch(() => null);
  const joinDate = block ? new Date(Number(block.timestamp) * 1000) : new Date();

  await db.insert(schema.userRegistrations).values({
    memberAddress: genesisAddress,
    sponsorAddress: ethers.ZeroAddress,
    memberId,
    stringId,
    blockNumber: DEPLOY_BLOCK,
    txHash: "GENESIS_SEED",
    logIndex: 0,
    blockTimestamp: joinDate,
  }).onConflictDoNothing();

  await db.insert(schema.userDetails).values({
    userAddress: genesisAddress,
    sponsorAddress: ethers.ZeroAddress,
    userName: null,
    dateOfRegistration: joinDate,
  }).onConflictDoNothing();

  await db.insert(schema.dashboard).values({
    userAddress: genesisAddress,
    sponsorId: "",
  }).onConflictDoNothing();

  console.log(`seeded root admin ${genesisAddress} (${stringId}, memberId=${memberId})`);
}

async function seed() {
  await seedIndexerState();
  await seedRootAdmin();
}

// Only run as a CLI (`npm run db:seed`) — guarded so importing seedRootAdmin
// elsewhere (indexer startup) doesn't also trigger this exit-on-finish block.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
