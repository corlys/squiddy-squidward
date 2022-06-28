import { EvmLogHandlerContext } from "@subsquid/substrate-evm-processor";
// import { WebsocketProvider as W3S} from "web3-providers-ws";
// import Web3 from "web3";
import { ethers } from "ethers";
import { Contract } from "../model";
import { abi } from "../abi/erc721";
import { PUBLIC_CHAIN_NODE, HTTPS_NODE, processTransfer } from "../contract";

// const w3s = new W3S(PUBLIC_CHAIN_NODE, {
//   timeout: 30 * 10 ** 3,
//   clientConfig: {

//     // Useful to keep a connection alive
//     keepalive: true,
//     keepaliveInterval: 60 * 10 ** 3, // ms
//   },
//   reconnect: {
//     auto: true,
//     delay: 5 * 10 ** 3
//   }
// });

// const web3: ethers.providers.ExternalProvider = new Web3(w3s);

// let w3sProvider = new ethers.providers.Web3Provider(web3);
let wsProvider = new ethers.providers.WebSocketProvider(PUBLIC_CHAIN_NODE);
let httpsProvider = new ethers.providers.JsonRpcProvider(HTTPS_NODE);

export let jukiverseContract = new ethers.Contract(
  "0xd9B46b36C14092EE2200aE7D9BF1873375861E04".toLowerCase(),
  abi,
  wsProvider
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
  console.log("BEGIN!");
  const currentBlock = await jukiverseContract.provider.getBlockNumber();
  console.log(
    `Contract with address ${jukiverseContract.address.toLowerCase()}`
  );
  console.log("Im on processJukiverseTransfer ", currentBlock);
  return processTransfer(ctx, jukiverseContract);
}
