import { EvmLogHandlerContext } from "@subsquid/substrate-evm-processor";
import { ethers } from "ethers";
import { Contract } from "../model";
import { abi } from "../abi/erc721";
import { PUBLIC_CHAIN_NODE, HTTPS_NODE, processTransfer } from "../contract";

let wsProvider = new ethers.providers.WebSocketProvider(PUBLIC_CHAIN_NODE);
let httpsProvider = new ethers.providers.JsonRpcProvider(HTTPS_NODE)

export const astarCatsContract = new ethers.Contract(
  "0x8b5d62f396Ca3C6cF19803234685e693733f9779".toLowerCase(),
  abi,
  wsProvider
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
  const currentBlock = await astarCatsContract.provider.getBlockNumber();
  console.log(
    `Contract with address ${astarCatsContract.address.toLowerCase()}`
  );
  console.log("Im on processAstarCatsTransfers ", currentBlock);
  return processTransfer(ctx, astarCatsContract);
}
