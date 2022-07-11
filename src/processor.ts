// src/processor.ts
import { SubstrateEvmProcessor } from "@subsquid/substrate-evm-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import { PUBLIC_CHAIN_NODE } from "./contract";
import { events } from "./abi/erc721";
import { events as marketplaceEvent } from "./abi/marketPlace";

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
import {
  createFishMarketplaceContract,
  fishMarketplaceContract,
  processMarketplaceBuy,
  processMarketplaceSell,
} from "./helper/FishMarketplace";
import {
  createNftFishContract,
  nftFishContract,
  processNftFishTransfers,
} from "./helper/NFTFish";

const processor = new SubstrateEvmProcessor("astar-substrate");

/**
 * AstarCats startBlock : 800854
 * AstarDegens startBlock : 442693
 * Jukiverse startBlock : 1248161
 */

// listen from astarDegens startBlock and up!
// processor.setBlockRange({ from: 442693 });

// listen from astarCats startBlock and up!
// processor.setBlockRange({ from: 800854 })

// listen from Jukiverse startBlock and up!
// processor.setBlockRange({ from: 1248161 });

// listen from NFT Fish startBlock and up!
processor.setBlockRange({ from: 1392785 });

processor.setBatchSize(500);

processor.setDataSource({
  chain: PUBLIC_CHAIN_NODE,
  archive: lookupArchive("astar")[0].url,
});

processor.setTypesBundle("astar");

// Create Astar Degens contract Entitiy in their startBlock
// processor.addPreHook({ range: { from: 442693, to: 442693 } }, async (ctx) => {
//   await ctx.store.save(createAstarDegenContract());
// });
// processor.addPreHook({ range: { from: 442693, to: 442693 } }, async (ctx) => {
//   await ctx.store.save(createAstarDegenContract());
// });

// // Create AstarCats contract Entity in their startBlock
// processor.addPreHook({ range: { from: 800854, to: 800854 } }, async (ctx) => {
//   await ctx.store.save(createAstarCatsContract());
// });

// // Create Jukiverse contract Entity in their startBlock
// processor.addPreHook({ range: { from: 1248161, to: 1248161 } }, async (ctx) => {
//   await ctx.store.save(createJukiverseContract());
// });

// Create NFTFish contract Entity in their startBlock
processor.addPreHook({ range: { from: 1392785, to: 1392785 } }, async (ctx) => {
  await ctx.store.save(createNftFishContract());
});

// Create Marketplace contract Entity in their startBlock
processor.addPreHook({ range: { from: 1398687, to: 1398687 } }, async (ctx) => {
  await ctx.store.save(createFishMarketplaceContract());
});

// // Event listener for Transfer Astar Degens
// processor.addEvmLogHandler(
//   astarDegensContract.address.toLowerCase(),
//   {
//     filter: [events["Transfer(address,address,uint256)"].topic],
//   },
//   processAstarDegenTransfers
// );

// // Event listener for Transfer AstarCats Contract
// processor.addEvmLogHandler(
//   astarCatsContract.address.toLowerCase(),
//   {
//     filter: [events["Transfer(address,address,uint256)"].topic],
//   },
//   processAstarCatsTransfers
// );

// // Event listener for Transfer Jukiverse Contract
// processor.addEvmLogHandler(
//   jukiverseContract.address.toLowerCase(),
//   {
//     filter: [events["Transfer(address,address,uint256)"].topic],
//   },
//   processJukiverseTransfer
// );

// Event listener for Transfer NFTFish Contract
processor.addEvmLogHandler(
  nftFishContract.address.toLowerCase(),
  {
    filter: [events["Transfer(address,address,uint256)"].topic],
  },
  processNftFishTransfers
);

// Event listener for buEvent FishMartetplace Contract
processor.addEvmLogHandler(
  fishMarketplaceContract.address.toLowerCase(),
  {
    filter: [
      marketplaceEvent[
        "BuyEvent(address,address,uint256,uint256,uint256,address)"
      ].topic,
    ],
  },
  processMarketplaceBuy
);

// Event listener for sellEvent FishMartetplace Contract
processor.addEvmLogHandler(
  fishMarketplaceContract.address.toLowerCase(),
  {
    filter: [
      marketplaceEvent["SellEvent(address,uint256,uint256,address)"].topic,
    ],
  },
  processMarketplaceSell
);

processor.run();
