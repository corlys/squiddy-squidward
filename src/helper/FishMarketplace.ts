import { EvmLogHandlerContext } from "@subsquid/substrate-evm-processor";
import { ethers } from "ethers";
import { Contract } from "../model";
import { abi } from "../abi/erc721";
import {
  PUBLIC_CHAIN_NODE,
  PRIVATE_CHAIN_NODE,
  HTTPS_NODE,
  processTransfer,
  handleBuy,
  handleSell,
} from "../contract";

import WebsocketProvider from "web3-providers-ws";

// @ts-ignore It appears default export is required otherwise it throws 'WebsocketProvider is not a constructor error', the typings says otherwise but well ...
const w3s = new WebsocketProvider(PRIVATE_CHAIN_NODE, {
  timeout: 30 * 10 ** 3,
  clientConfig: {
    // Useful to keep a connection alive
    keepalive: true,
    keepaliveInterval: 60 * 10 ** 3, // ms
  },
  reconnect: {
    auto: true,
    delay: 40 * 10 ** 3,
  },
});

let w3sProvider = new ethers.providers.Web3Provider(w3s);

// let wsProvider = new ethers.providers.WebSocketProvider(PUBLIC_CHAIN_NODE);
// let httpsProvider = new ethers.providers.JsonRpcProvider(HTTPS_NODE);

export const fishMarketplaceContract = new ethers.Contract(
  "0x5361ea4aC16458d83579e197DE1649e31f8529eD".toLowerCase(),
  abi,
  w3sProvider
);

export function createFishMarketplaceContract(): Contract {
  return new Contract({
    id: fishMarketplaceContract.address,
    name: "Fish Marketplace",
  });
}

export async function processMarketplaceBuy(
  ctx: EvmLogHandlerContext
): Promise<void> {
  console.log("BEGIN!");
  // const currentBlock = await fishMarketplaceContract.provider.getBlockNumber();
  console.log(
    `Contract with address ${fishMarketplaceContract.address.toLowerCase()}`
  );
  // console.log("Im on processAstarDegenTransfer ", currentBlock);
  return handleBuy(ctx, fishMarketplaceContract);
}

export async function processMarketplaceSell(
  ctx: EvmLogHandlerContext
): Promise<void> {
  console.log("BEGIN!");
  // const currentBlock = await fishMarketplaceContract.provider.getBlockNumber();
  console.log(
    `Contract with address ${fishMarketplaceContract.address.toLowerCase()}`
  );
  // console.log("Im on processAstarDegenTransfer ", currentBlock);
  return handleSell(ctx, fishMarketplaceContract);
}
