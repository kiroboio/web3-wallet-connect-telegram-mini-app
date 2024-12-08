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
import { SCHEMA, SecureLocalStorage } from "../utils/secureStorage";

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

type TriggerKey = keyof ReturnType<typeof getTriggers>;
function addSubscription({
  triggerId,
  intentId,
  address,
  provider,
  socket,
  userId,
  externalVariables,
  secureLocalStorage,
}: {
  triggerId: TriggerKey;
  intentId: string;
  address: string;
  provider: JsonRpcProvider;
  socket: Socket | null;
  userId: string;
  externalVariables: ExternalVariables;
  secureLocalStorage: SecureLocalStorage;
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
    secureLocalStorage,
  })[triggerId as keyof ReturnType<typeof getTriggers>];

  switch (trigger.type) {
    case "swap":
      trigger.handleEvent();
      break;

    case "subscribe":
      const listener = async (log: unknown) => {
        console.log(
          `Event received for triggerId: ${triggerId}, intentId: ${intentId}`
        );

        const res = await trigger.handleEvent(log);

        return res;
      };
      provider.on(trigger.filter, listener);
      subscriptions.set(key, { filter: trigger.filter, listener });
      break;
  }
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
          signature: "local storage error",
        });
        return;
      }
      const sign = await secureLocalStorage.signMessage(message);

      socket.emit("signedMessage", {
        userId: Number(userId),
        signature: sign,
      });

      return;
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

        getTriggers({
          address: secureLocalStorage.address,
          provider: sepoliaProvider,
          intentId,
          socket,
          userId,
          externalVariables,
          secureLocalStorage,
        })['signMessage'].handleEvent({ message, encodedValues, intentId, type, externalVariables})
        // const emitSignatureMessage = async () => {
        //   const signature = await secureLocalStorage.signMessage(
        //     utils.isBytesLike(message) ? utils.arrayify(message) : message
        //   );

        //   socket.emit("signedMessage", {
        //     userId: Number(userId),
        //     signature,
        //     encodedValues,
        //     intentId,
        //   });
        //   console.log({ signature, encodedValues, intentId, message });
        // };

        // console.log({ externalVariables, type });
        // emitSignatureMessage();
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
        // if (type !== "STRATAGY") return;
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
            executions: [],
          },
        });
        addSubscription({
          triggerId: triggerId as TriggerKey,
          intentId,
          address: secureLocalStorage.address,
          provider: sepoliaProvider,
          socket,
          userId,
          externalVariables,
          secureLocalStorage,
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
