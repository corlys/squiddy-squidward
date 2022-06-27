// src/processor.ts
import { SubstrateEvmProcessor } from "@subsquid/substrate-evm-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import { CHAIN_NODE, processTransfer } from "./contract";
import { events } from "./abi/erc721";

import {
  createAstarCatsContract,
  astarCatsContract,
  processAstarCatsTransfers,
} from "./helper/AstarCats";
import {
  createJukiverseContract,
  jukiverseContract,
  processJukiverseTransfer,
} from "./helper/Jukiverse";
import {
  createAstarDegenContract,
  astarDegensContract,
  processAstarDegenTransfers,
} from "./helper/AstarDegens";

const processor = new SubstrateEvmProcessor("astar-substrate");

/**
 * AstarCats startBlock : 800854
 * AstarDegens startBlock : 442693
 * Jukiverse startBlock : 1248161
 */

// listen from astarDegens startBlock and up!
processor.setBlockRange({ from: 442693 });

// listen from astarCats startBlock and up!
// processor.setBlockRange({ from: 800854 })

// listen from Jukiverse startBlock and up!
// processor.setBlockRange({ from: 1248161 });

processor.setBatchSize(500);

processor.setDataSource({
  chain: CHAIN_NODE,
  archive: lookupArchive("astar")[0].url,
});

processor.setTypesBundle("astar");

// Create Astar Degens contract Entitiy in their startBlock
// processor.addPreHook({ range: { from: 442693, to: 442693 } }, async (ctx) => {
//   await ctx.store.save(createAstarDegenContract());
// });
processor.addPreHook({ range: { from: 442693, to: 442693 } }, async (ctx) => {
  await ctx.store.save(createAstarDegenContract());
});

// Create AstarCats contract Entity in their startBlock
processor.addPreHook({ range: { from: 800854, to: 800854 } }, async (ctx) => {
  await ctx.store.save(createAstarCatsContract());
});

// Create Jukiverse contract Entity in their startBlock
processor.addPreHook({ range: { from: 1248161, to: 1248161 } }, async (ctx) => {
  await ctx.store.save(createJukiverseContract());
});

// Event listener for Astar Degens
processor.addEvmLogHandler(
  astarDegensContract.address.toLowerCase(),
  {
    filter: [events["Transfer(address,address,uint256)"].topic],
  },
  processAstarDegenTransfers
);

// Event listener for AstarCats Contract
processor.addEvmLogHandler(
  astarCatsContract.address.toLowerCase(),
  {
    filter: [events["Transfer(address,address,uint256)"].topic],
  },
  processAstarCatsTransfers
);

// Event listener for Jukiverse Contract
processor.addEvmLogHandler(
  jukiverseContract.address.toLowerCase(),
  {
    filter: [events["Transfer(address,address,uint256)"].topic],
  },
  processJukiverseTransfer
);

processor.run();
