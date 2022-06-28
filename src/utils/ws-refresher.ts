import { ethers } from "ethers";
import { PUBLIC_CHAIN_NODE } from "../contract";

const EXPECTED_PONG_BACK = 15000;
const KEEP_ALIVE_CHECK_INTERVAL = 7500;

export const startConnection = (
  wsProvider: ethers.providers.WebSocketProvider,
  contract: ethers.Contract,
  abi: ethers.utils.Interface,
  address: string
) => {
  let pingTimeout: NodeJS.Timer;
  let keepAliveInterval: NodeJS.Timer;

  wsProvider = new ethers.providers.WebSocketProvider(PUBLIC_CHAIN_NODE);

  contract = new ethers.Contract(address, abi, wsProvider);

  wsProvider.on("open", () => {
    keepAliveInterval = setInterval(() => {
      wsProvider._websocket.ping();

      // Use `WebSocket#terminate()`, which immediately destroys the connection,
      // instead of `WebSocket#close()`, which waits for the close timer.
      // Delay should be equal to the interval at which your server
      // sends out pings plus a conservative assumption of the latency.
      pingTimeout = setTimeout(() => {
        wsProvider._websocket.terminate();
      }, EXPECTED_PONG_BACK);
    }, KEEP_ALIVE_CHECK_INTERVAL);
  });

  wsProvider._websocket.on("close", () => {
    clearInterval(keepAliveInterval);
    clearTimeout(pingTimeout);
    startConnection(wsProvider, contract, abi, address);
  });

  wsProvider._websocket.on("pong", () => {
    // console.log("Received pong, so connection is alive, clearing the timeout");
    clearInterval(pingTimeout);
  });
};
