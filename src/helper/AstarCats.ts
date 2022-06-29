import { EvmLogHandlerContext } from "@subsquid/substrate-evm-processor";
import { ethers } from "ethers";
import { Contract } from "../model";
import { abi } from "../abi/erc721";
import {
  PUBLIC_CHAIN_NODE,
  PRIVATE_CHAIN_NODE,
  HTTPS_NODE,
  processTransfer,
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
// let httpsProvider = new ethers.providers.JsonRpcProvider(HTTPS_NODE)

export const astarCatsContract = new ethers.Contract(
  "0x8b5d62f396Ca3C6cF19803234685e693733f9779".toLowerCase(),
  abi,
  w3sProvider
);

export function createAstarCatsContract(): Contract {
  return new Contract({
    id: astarCatsContract.address,
    name: "AstarCats",
    symbol: "CAT",
    totalSupply: 7777n,
  });
}

export async function processAstarCatsTransfers(
  ctx: EvmLogHandlerContext
): Promise<void> {
  console.log("BEGIN!")
  // const currentBlock = await astarCatsContract.provider.getBlockNumber();
  console.log(
    `Contract with address ${astarCatsContract.address.toLowerCase()}`
  );
  // console.log("Im on processAstarCatsTransfers ", currentBlock);
  return processTransfer(ctx, astarCatsContract);
}
