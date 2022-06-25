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
    // console.log(contractEntity);
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

  // const contract = await getContractEntity(ctx, ethersContract, undefined)

  // let token = await ctx.store.get(
  //   Token,
  //   contract.name + "-" + transfer.tokenId.toString()
  // );
  console.log(
    "================================================================================"
  );
  console.log(
    `Now indexing contract : ${ethersContract.address} and the ctx is ${ctx.contractAddress}`
  );
  console.log(`at txHash : ${ctx.txHash}`);
  console.log(`and block : ${ctx.substrate.block.height}`);
  console.log(
    `at timestamp : ${new Date(ctx.substrate.block.timestamp * 1000)}`
  );
  let token = await ctx.store.get(
    Token,
    `${ethersContract.address}-${transfer.tokenId.toString()}`
  );
  console.log(
    `token that is fetched with id ${
      ethersContract.address
    }-${transfer.tokenId.toString()} is ${token}`
  );
  if (token == null) {
    console.log("the token is null or undefined");
    console.log("Heres the input : ");
    console.log(
      `id : ${ethersContract.address}-${transfer.tokenId.toString()}`
    );
    console.log(`uri : ${await ethersContract.tokenURI(transfer.tokenId)}`);
    console.log(`tokenId: ${parseInt(transfer.tokenId.toString())}`);
    console.log(`to address : ${to.id}`);
    console.log(
      `contract address ${
        (await getContractEntity(ctx, ethersContract, undefined)).id
      }`
    );
    const input = {
      // id: contract.name + "-" + transfer.tokenId.toString(),
      // id: transfer.tokenId.toString(),
      id: `${ethersContract.address}-${transfer.tokenId.toString()}`,
      uri: await ethersContract.tokenURI(transfer.tokenId),
      tokenId: parseInt(transfer.tokenId.toString()),
      contract: await getContractEntity(ctx, ethersContract, undefined),
      owner: to,
    };
    console.log(`token input : ${input}`);
    token = new Token(input);
    console.log(`token that is made: ${token}`);
    await ctx.store.save(token);
    token = await ctx.store.get(Token, token.id);
    console.log(`token that is saved: ${token}`);
  } else {
    console.log("the token exist");
    token.owner = to;
    console.log(`token that is updated: ${token}`);
    await ctx.store.save(token);
    token = await ctx.store.get(Token, token.id);
    console.log(`token that is saved: ${token}`);
  }

  console.log(`from : ${from.id}`);
  console.log(`to : ${to.id}`);

  const saveTransfer = await ctx.store.save(
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

  console.log(`transfer : ${saveTransfer.transactionHash}`);
  console.log(
    "===============================================================================n\n"
  );
}
