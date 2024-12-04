import { useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { utils } from "ethers";
import { useSecureStorage } from "../context/SecureStorageProvider";
import { getProvider } from "../triggers/provider/provider";
import { EventType, JsonRpcProvider } from "@ethersproject/providers";
import { Socket } from "socket.io-client";
import {
  ExternalVariables,
  getTriggers,
  TriggerSubscriptionParams,
  TriggerType,
} from "../triggers/triggers";
import { getSwapQuote } from "../triggers/logic/uniswapv2GetAmountOut";
import { SCHEMA } from "../utils/secureStorage";

const subscriptions: Map<
  string,
  { filter: EventType; listener: (l: unknown) => Promise<void> }
> = new Map();

const getSubscriptionKey = ({
  triggerId,
  intentId,
}: {
  triggerId: EventType;
  intentId: string;
}) => `${triggerId}_${intentId}`;

function clearSubscription({
  triggerId,
  intentId,
  provider,
}: {
  triggerId: string;
  intentId: string;
  provider: JsonRpcProvider;
}) {
  const key = getSubscriptionKey({ triggerId, intentId });
  const prevSubscription = subscriptions.get(key);
  if (!prevSubscription) return;

  const { filter: oldFilter, listener: oldListener } = prevSubscription;
  provider.off(oldFilter, oldListener);
  subscriptions.delete(key);

  console.log({ removePrevSubscriptio: prevSubscription });
}

function addSubscription({
  triggerId,
  intentId,
  address,
  provider,
  socket,
  userId,
  externalVariables,
}: {
  triggerId: string;
  intentId: string;
  address: string;
  provider: JsonRpcProvider;
  socket: Socket | null;
  userId: string;
  externalVariables: ExternalVariables;
}) {
  const key = getSubscriptionKey({ triggerId, intentId });
  clearSubscription({ triggerId, intentId, provider });

  const trigger = getTriggers({
    address,
    provider,
    intentId,
    socket,
    userId,
    externalVariables,
  })[triggerId as keyof ReturnType<typeof getTriggers>];
  const listener = async (log: unknown) => {
    console.log(
      `Event received for triggerId: ${triggerId}, intentId: ${intentId}`
    );

    const res = await trigger.proccessLog(log);

    return res;
  };
  provider.on(trigger.filter, listener);
  subscriptions.set(key, { filter: trigger.filter, listener });
}

const sepoliaProvider = getProvider("11155111");

export const WalletSign = ({ userId }: { userId?: string | null }) => {
  const { socket } = useSocket();
  const secureLocalStorage = useSecureStorage();

  useEffect(() => {
    if (!socket) return;
    if (!userId) return;

    socket.on("signRequestPing", async ({ message }: { message: string }) => {
      if (!secureLocalStorage) {
        socket.emit("signedMessage", {
          userId: Number(userId),
          signature: 'local storage error',
        });
        return;
      }
      const sign = await secureLocalStorage.signMessage(message);

      socket.emit("signedMessage", {
        userId: Number(userId),
        signature: sign,
      });

      return
    });
    // Listen for sign requests
    socket.on(
      "signRequest",
      async ({
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
      }) => {
        if (!secureLocalStorage?.address) {
          alert("No wallet found!");
          return;
        }

        const emitSignatureMessage = async () => {
          const signature = await secureLocalStorage.signMessage(
            utils.isBytesLike(message) ? utils.arrayify(message) : message
          );

          socket.emit("signedMessage", {
            userId: Number(userId),
            signature,
            encodedValues,
            intentId,
          });
          console.log({ signature, encodedValues, intentId, message });
        };

        console.log({ externalVariables, type });
        switch (type) {
          case "TRANSACTION_EXECUTE_ONLY":
            emitSignatureMessage();
            break;

          case "STRATAGY":
            emitSignatureMessage();
            break;

          case "SWAP_PROTECT":
            const tokens = externalVariables
              ?.filter((variable) => variable.type === "token")
              .sort(
                (token1, token2) => (token1.index || 0) - (token2.index || 0)
              );

            const amount = externalVariables?.find(
              (variable) =>
                variable.type === "integer" || variable.type === "number"
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

            socket?.emit("triggerProtectedSwap", {
              userId: Number(userId),
              triggerId: "protectedSwap",
              intentId,
              externalVariables,
            });

            break;
        }
      }
    );

    socket.on(
      "activateTrigger",
      async ({
        triggerId,
        intentId,
        externalVariables,
        type,
      }: TriggerSubscriptionParams) => {
        console.log({
          triggerId,
          intentId,
          externalVariables,
          activeTrigger: true,
        });
        if (type !== "STRATAGY") return;
        if (!secureLocalStorage?.address) {
          alert("No wallet found!");
          return;
        }

        secureLocalStorage?.storeTriggerData(SCHEMA.TRIGGER, {
          value: {
            triggerId,
            intentId,
            externalVariables,
            type,
          },
        });
        addSubscription({
          triggerId,
          intentId,
          address: secureLocalStorage.address,
          provider: sepoliaProvider,
          socket,
          userId,
          externalVariables,
        });
      }
    );

    socket.on("removeTrigger", async ({ triggerId, intentId }) => {
      console.log({ remove: true, triggerId, intentId });
      secureLocalStorage?.clearTriggerData(SCHEMA.TRIGGER, {
        triggerId,
        intentId,
      });
      if (!secureLocalStorage?.address) {
        alert("No wallet found!");
        return;
      }

      clearSubscription({
        triggerId,
        intentId,
        provider: sepoliaProvider,
      });
    });
    return () => {
      socket.off("signRequest");
      socket.off("activateTrigger");
      socket.off("removeTrigger");
    };
  }, [socket, userId, secureLocalStorage]);

  return null; // This component doesn't render anything
};
