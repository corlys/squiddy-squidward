import { EvmLogHandlerContext } from "@subsquid/substrate-evm-processor";
import { ethers } from "ethers";
import { Contract } from "../model";
import { abi } from "../abi/erc721";
import { CHAIN_NODE, processTransfer } from "../contract";

export const jukiverseContract = new ethers.Contract(
  "0xd9B46b36C14092EE2200aE7D9BF1873375861E04".toLowerCase(),
  abi,
  new ethers.providers.WebSocketProvider(CHAIN_NODE)
);

export function createJukiverseContract(): Contract {
  return new Contract({
    id: jukiverseContract.address,
    name: "JUKIVERSE",
    symbol: "JUKI",
    totalSupply: 10000n,
  });
}

export async function processJukiverseTransfer(
  ctx: EvmLogHandlerContext
): Promise<void> {
  return processTransfer(ctx, jukiverseContract);
}
