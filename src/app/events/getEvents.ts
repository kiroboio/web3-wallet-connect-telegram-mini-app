import { utils } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Socket } from "socket.io-client";
import type { ParamHanlde, UIType } from "@kiroboio/fct-builder";
import { Interface } from "ethers/lib/utils";
import { getSwapQuote } from "./swap/uniswapv2GetAmountOut";
import { SCHEMA, SecureLocalStorage } from "../utils/secureStorage";

export type ExternalVariables =
  | (ParamHanlde & {
      label: string;
      type?: UIType;
      fctType?: string;
      value?: string;
      index?: number;
      decimals?: number;
    })[]
  | undefined;

export type TriggerSubscriptionParams = {
  triggerId: string;
  intentId: string;
  externalVariables: ExternalVariables;
  type: TriggerType;
  executions: {
    time: Date;
    values: ExternalVariables;
    status?: "succeed" | "error";
    message?: string;
  }[];
};
export type TriggerType =
  | "TRANSACTION_EXECUTE_ONLY"
  | "STRATAGY"
  | "SWAP_PROTECT";
export const getEvents = ({
  address,
  provider,
  socket,
  userId,
  intentId,
  externalVariables,
  secureLocalStorage
}: {
  address: string;
  provider: JsonRpcProvider;
  socket: Socket | null;
  userId: string;
  intentId: string;
  externalVariables: ExternalVariables;
  secureLocalStorage: SecureLocalStorage;
}) => ({
  "tokenTransfer": {
    type: 'subscribe' as const,
    method: "transfer",
    abi: [`function transfer(address to, uint256 value)`],
    filter: {
      topics: [
        utils.id("Transfer(address,address,uint256)"),
        null,
        utils.hexZeroPad(address, 32),
      ],
    },

    handleEvent: async function (l: unknown) {
      const log = l as { address: string; transactionHash: string };
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

      secureLocalStorage.addTriggerExecution(SCHEMA.TRIGGER, { intentId, triggerId: 'tokenTransfer', execution: { time: new Date(), values: externalVariables }})
      socket?.emit("triggerValues", {
        userId: Number(userId),
        triggerId: 'tokenTransfer',
        intentId,
        externalVariables,
      });
    },
  },
  protectedSwap: {
    filter: undefined,
    type: 'swap' as const,
    handleEvent: async function () {
      const tokens = externalVariables
        ?.filter((variable) => variable.type === "token")
        .sort((token1, token2) => (token1.index || 0) - (token2.index || 0));

      const amount = externalVariables?.find(
        (variable) => variable.type === "integer" || variable.type === "number"
      )?.value;

      console.log({ tokens, amount });
      if (!amount) return;
      if (!tokens) return;

      const token1 = tokens[0];
      const token2 = tokens[1];

      console.log({ token1, token2 });
      if (!token1.decimals) return;
      if (!token2.decimals) return;

      const amountOut = await getSwapQuote?.({
        chainId: "11155111",
        fromToken: token1.value,
        fromDecimals: token1.decimals,
        toToken: token2.value,
        toDecimals: token2.decimals,
        recipient: secureLocalStorage?.address,
        amount: amount,
      });

      externalVariables?.find((variable) => {
        if (!(variable.handle === "methodParams.amountOutMin")) return;

        variable.value = amountOut;
      });

      secureLocalStorage?.addTriggerExecution(SCHEMA.TRIGGER, { intentId, triggerId: 'protectedSwap', execution: { time: new Date(), values: externalVariables }})
      socket?.emit("triggerProtectedSwap", {
        userId: Number(userId),
        triggerId: "protectedSwap",
        intentId,
        externalVariables,
      });
    },
  },
  signMessage: {
    type: 'sign' as const,
    filter: undefined,
    handleEvent: async function ({
      message,
      encodedValues,
      intentId,
      type,
      externalVariables,
    }: {
      message: string;
      encodedValues: string[];
      intentId: string;
      type: TriggerType;
      externalVariables: ExternalVariables;
    }) {
      if (!secureLocalStorage?.address) {
        alert("No wallet found!");
        return;
      }

      const emitSignatureMessage = async () => {
        const signature = await secureLocalStorage.signMessage(
          utils.isBytesLike(message) ? utils.arrayify(message) : message
        );

        socket?.emit("signedMessage", {
          userId: Number(userId),
          signature,
          encodedValues,
          intentId,
        });
        console.log({ signature, encodedValues, intentId, message });
      };

      console.log({ externalVariables, type });
      emitSignatureMessage();
    }
  }
});
