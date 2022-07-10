// src/contract.ts
import {
  assertNotNull,
  EvmLogHandlerContext,
  Store,
} from "@subsquid/substrate-evm-processor";
import { ethers } from "ethers";
import {
  Contract,
  Owner,
  Token,
  Transfer,
  Activity,
  ActivityType,
} from "./model";
import { events } from "./abi/erc721";
import { events as marketPlaceEvent } from "./abi/marketPlace";

// export const CHAIN_NODE =
//   "wss://astar.api.onfinality.io/ws?apikey=70f02ff7-58b9-4d16-818c-2bf302230f7d";
export const PUBLIC_CHAIN_NODE = "wss://astar.api.onfinality.io/public-ws";
export const PRIVATE_CHAIN_NODE =
  "wss://astar.api.onfinality.io/ws?apikey=70f02ff7-58b9-4d16-818c-2bf302230f7d";
export const HTTPS_NODE =
  "https://astar.api.onfinality.io/rpc?apikey=70f02ff7-58b9-4d16-818c-2bf302230f7d";

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
  let activityEntity = null;
  let activityType = ActivityType.TRANSFER;

  console.log(`listening block ${ctx.substrate.block.height}`);

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
  console.log(
    "================================================================================"
  );
  console.log(
    `Now indexing contract : ${ethersContract.address} and the ctx is ${ctx.contractAddress}`
  );
  let token = await ctx.store.get(
    Token,
    `${ethersContract.address}-${transfer.tokenId.toString()}`
  );
  if (token == null) {
    const input = {
      id: `${ethersContract.address}-${transfer.tokenId.toString()}`,
      uri: await ethersContract.tokenURI(transfer.tokenId.toString()),
      tokenId: parseInt(transfer.tokenId.toString()),
      contract: await getContractEntity(ctx, ethersContract, undefined),
      owner: to,
      price: BigInt(0),
      isListed: false,
    };
    token = new Token(input);
    await ctx.store.save(token);
    token = await ctx.store.get(Token, token.id);

    console.log(token);

    activityType = ActivityType.MINT;

    activityEntity = await ctx.store.get(
      Activity,
      ethersContract.address + "-" + ctx.txHash + "-" + activityType
    );

    if (activityEntity == null) {
      activityEntity = await ctx.store.save(
        new Activity({
          id: ethersContract.address + "-" + ctx.txHash + "-" + activityType,
          token,
          from,
          to,
          type: activityType,
          timestamp: BigInt(ctx.substrate.block.timestamp),
          block: ctx.substrate.block.height,
          transactionHash: ctx.txHash,
        })
      );
    }
  } else {
    token.owner = to;
    token.isListed = false;
    token.price = BigInt(0);
    await ctx.store.save(token);
    token = await ctx.store.get(Token, token.id);
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

  activityEntity = await ctx.store.get(
    Activity,
    ethersContract.address + "-" + ctx.txHash + "-" + activityType
  );

  if (activityEntity == null) {
    activityEntity = await ctx.store.save(
      new Activity({
        id: ethersContract.address + "-" + ctx.txHash + "-" + activityType,
        token,
        from,
        to,
        type: activityType,
        timestamp: BigInt(ctx.substrate.block.timestamp),
        block: ctx.substrate.block.height,
        transactionHash: ctx.txHash,
      })
    );
  }

  console.log("Done handling token : ", token?.id);

  console.log(
    "===============================================================================n\n"
  );
}

export const handleBuy = async (
  ctx: EvmLogHandlerContext,
  ethersContract: ethers.Contract
) => {
  const buyEvent =
    marketPlaceEvent[
      "BuyEvent(address,address,uint256,uint256,uint256)"
    ].decode(ctx);

  let activityType = ActivityType.SOLD;
  let activityEntity = null;

  let from = await ctx.store.get(Owner, buyEvent.seller);
  if (from == null) {
    from = new Owner({ id: buyEvent.seller, balance: 0n });
    await ctx.store.save(from);
  }

  let to = await ctx.store.get(Owner, buyEvent.buyer);
  if (to == null) {
    to = new Owner({ id: buyEvent.buyer, balance: 0n });
    await ctx.store.save(to);
  }

  let token = await ctx.store.get(
    Token,
    `0xd85eeb75e672e33fe6176066f7e568c275d91725-${buyEvent.tokenId.toString()}`
  );

  if (token != null) {
    token.isListed = false;
    token.price = BigInt(0);
    await ctx.store.save(token);
  }

  // if (token == null) {
  //   // highly unlikely, but not impossible
  //   const input = {
  //     id: `${ethersContract.address}-${buyEvent.tokenId.toString()}`,
  //     uri: await ethersContract.tokenURI(buyEvent.tokenId.toString()),
  //     tokenId: parseInt(buyEvent.tokenId.toString()),
  //     contract: await getContractEntity(ctx, ethersContract, undefined),
  //     owner: to,
  //   };
  //   token = new Token(input);
  //   await ctx.store.save(token);
  //   token = await ctx.store.get(Token, token.id);

  //   activityType = ActivityType.MINT;

  //   activityEntity = await ctx.store.get(
  //     Activity,
  //     ethersContract.address + "-" + ctx.txHash + "-" + activityType
  //   );

  //   if (activityEntity == null) {
  //     activityEntity = await ctx.store.save(
  //       new Activity({
  //         id: ethersContract.address + "-" + ctx.txHash + "-" + activityType,
  //         token,
  //         from,
  //         to,
  //         type: activityType,
  //         timestamp: BigInt(ctx.substrate.block.timestamp),
  //         block: ctx.substrate.block.height,
  //         transactionHash: ctx.txHash,
  //       })
  //     );
  //   }
  // } else {
  //   token.owner = to;
  //   await ctx.store.save(token);
  //   token = await ctx.store.get(Token, token.id);
  // }

  activityEntity = await ctx.store.get(
    Activity,
    ethersContract.address + "-" + ctx.txHash + "-" + activityType
  );

  if (activityEntity == null) {
    activityEntity = await ctx.store.save(
      new Activity({
        id: ethersContract.address + "-" + ctx.txHash + "-" + activityType,
        token,
        from,
        to,
        type: activityType,
        timestamp: BigInt(ctx.substrate.block.timestamp),
        block: ctx.substrate.block.height,
        transactionHash: ctx.txHash,
      })
    );
  }
};

export const handleSell = async (
  ctx: EvmLogHandlerContext,
  ethersContract: ethers.Contract
) => {
  const sellEvent =
    marketPlaceEvent[
      "SellEvent(address,uint256,uint256,uint256,uint256)"
    ].decode(ctx);

  let activityType = ActivityType.LISTING;
  let activityEntity = null;

  let from = await ctx.store.get(Owner, sellEvent.seller);
  if (from == null) {
    from = new Owner({ id: sellEvent.seller, balance: 0n });
    await ctx.store.save(from);
  }

  let token = await ctx.store.get(
    Token,
    `0xd85eeb75e672e33fe6176066f7e568c275d91725-${sellEvent.tokenId.toString()}`
  );

  if (token != null) {
    token.isListed = true;
    token.price = sellEvent.price.toBigInt();
    await ctx.store.save(token);
  }

  activityEntity = await ctx.store.get(
    Activity,
    ethersContract.address + "-" + ctx.txHash + "-" + activityType
  );

  if (activityEntity == null) {
    activityEntity = await ctx.store.save(
      new Activity({
        id: ethersContract.address + "-" + ctx.txHash + "-" + activityType,
        token,
        from,
        price: sellEvent.price.toBigInt(),
        type: activityType,
        timestamp: BigInt(ctx.substrate.block.timestamp),
        block: ctx.substrate.block.height,
        transactionHash: ctx.txHash,
      })
    );
  }
};
