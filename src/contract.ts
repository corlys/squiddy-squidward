// src/contract.ts
import {
  assertNotNull,
  EvmLogHandlerContext,
  Store,
} from "@subsquid/substrate-evm-processor";
import { ethers } from "ethers";
import { Contract, Owner, Token, Transfer } from "./model";
import { events, abi } from "./abi/erc721";

export const CHAIN_NODE =
  "wss://astar.api.onfinality.io/ws?apikey=70f02ff7-58b9-4d16-818c-2bf302230f7d";

export async function getContractEntity(
  {
    store,
  }: {
    store: Store;
  },
  ethersContract: ethers.Contract,
  contractEntity: Contract | undefined
): Promise<Contract> {
  if (contractEntity == null) {
    contractEntity = await store.get(Contract, ethersContract.address);
  }
  return assertNotNull(contractEntity);
}

export async function processTransfer(
  ctx: EvmLogHandlerContext,
  ethersContract: ethers.Contract
): Promise<void> {
  const transfer = events["Transfer(address,address,uint256)"].decode(ctx);

  let from = await ctx.store.get(Owner, transfer.from);
  if (from == null) {
    from = new Owner({ id: transfer.from, balance: 0n });
    await ctx.store.save(from);
  }

  let to = await ctx.store.get(Owner, transfer.to);
  if (to == null) {
    to = new Owner({ id: transfer.to, balance: 0n });
    await ctx.store.save(to);
  }

  // let token = await ctx.store.get(
  //   Token,
  //   ethersContract.address + "-" + transfer.tokenId.toString()
  // );
  let token = await ctx.store.get(
    Token,
    transfer.tokenId.toString()
  );
  if (token == null) {
    token = new Token({
      // id: ethersContract.address + "-" + transfer.tokenId.toString(),
      id: transfer.tokenId.toString(),
      uri: await ethersContract.tokenURI(transfer.tokenId),
      // tokenId: transfer.tokenId.toNumber(),
      contract: await getContractEntity(ctx, ethersContract, undefined),
      owner: to,
    });
    await ctx.store.save(token);
  } else {
    token.owner = to;
    await ctx.store.save(token);
  }

  await ctx.store.save(
    new Transfer({
      id: ctx.txHash,
      token,
      from,
      to,
      timestamp: BigInt(ctx.substrate.block.timestamp),
      block: ctx.substrate.block.height,
      transactionHash: ctx.txHash,
    })
  );
}
