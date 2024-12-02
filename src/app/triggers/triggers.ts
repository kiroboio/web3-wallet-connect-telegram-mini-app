import { utils } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Socket } from "socket.io-client";
import type { ParamHanlde, UIType } from "@kiroboio/fct-builder";
import { Interface } from "ethers/lib/utils";

export type ExternalVariables =
  | (ParamHanlde & {
    label: string;
    type?: UIType;
    fctType?: string;
    value?: unknown;
    index?: number;
    decimals?: number
  })[]
  | undefined;

export type TriggerType =
  | "TRANSACTION_EXECUTE_ONLY"
  | "STRATAGY"
  | "SWAP_PROTECT";
export const getTriggers = ({
  address,
  provider,
  socket,
  userId,
  intentId,
  externalVariables,
}: {
  address: string;
  provider: JsonRpcProvider;
  socket: Socket | null;
  userId: string;
  intentId: string;
  externalVariables: ExternalVariables;
}) => ({
  "0x2": {
    method: "transfer",
    abi: [`function transfer(address to, uint256 value)`],
    filter: {
      topics: [
        utils.id("Transfer(address,address,uint256)"),
        null,
        utils.hexZeroPad(address, 32),
      ],
    },

    proccessLog: async function (l: unknown) {
      const log = l as { address: string, transactionHash: string }
      console.log({ log });
      const trx = await provider.getTransaction(log.transactionHash);
      console.log({ trx });
      if (!trx) return;

      const iface = new Interface(this.abi);

      const decodedData = iface.decodeFunctionData(this.method, trx.data);

      const receiver = decodedData.to;
      const amount = decodedData.value?.toString();

      const tokenAddress = log.address;

      console.log({ tokenAddress, decodedData, receiver, amount });

      if (
        !tokenAddress ||
        !amount ||
        receiver?.toLowerCase() !== address?.toLowerCase()
      ) {
        console.warn(`wrong transaction`);
        return;
      }

      externalVariables?.forEach((variable) => {
        switch (variable.type) {
          case "token":
            variable.value = tokenAddress;
            break;
          case "number":
            variable.value = amount;
            break;
        }
      });

      socket?.emit("triggerValues", {
        userId: Number(userId),
        triggerId: "0x2",
        intentId,
        externalVariables,
      });
    },
  },
});
