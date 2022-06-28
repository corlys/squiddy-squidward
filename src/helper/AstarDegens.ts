import { EvmLogHandlerContext } from "@subsquid/substrate-evm-processor";
import { ethers } from "ethers";
import { Contract } from "../model";
import { abi } from "../abi/erc721";
import { PUBLIC_CHAIN_NODE, HTTPS_NODE, processTransfer } from "../contract";

let wsProvider = new ethers.providers.WebSocketProvider(PUBLIC_CHAIN_NODE);
let httpsProvider = new ethers.providers.JsonRpcProvider(HTTPS_NODE);

export const astarDegensContract = new ethers.Contract(
  "0xd59fC6Bfd9732AB19b03664a45dC29B8421BDA9a".toLowerCase(),
  abi,
  wsProvider
);

export function createAstarDegenContract(): Contract {
  return new Contract({
    id: astarDegensContract.address,
    name: "AstarDegens",
    symbol: "DEGEN",
    totalSupply: 10000n,
  });
}

export async function processAstarDegenTransfers(
  ctx: EvmLogHandlerContext
): Promise<void> {
  console.log("BEGIN!")
  const currentBlock = await astarDegensContract.provider.getBlockNumber();
  console.log(
    `Contract with address ${astarDegensContract.address.toLowerCase()}`
  );
  console.log("Im on processAstarDegenTransfer ", currentBlock);
  return processTransfer(ctx, astarDegensContract);
}
