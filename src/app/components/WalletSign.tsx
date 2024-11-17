import { useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { ethers, getBytes, isBytesLike, zeroPadValue } from "ethers";
import { useSecureStorage } from "../context/SecureStorageProvider";
import { provider } from "../provider/provider";
import { EventType, JsonRpcProvider } from "@ethersproject/providers";

const getTriggers = ({
  address,
  provider,
}: {
  address: string;
  provider: JsonRpcProvider;
}) => ({
  "0x1": {
    method: "transfer",
    abi: [`function transfer(address to, uint256 value)`],
    filter: {
      topics: [
        ethers.id("Transfer(address,address,uint256)"),
        null,
        zeroPadValue(address, 32),
      ],
    },

    proccessLog: async function (log: any) {
      console.log({ log });
      const trx = await provider.getTransaction(log.transactionHash);
      console.log({ trx });
      if (!trx) return;

      const iface = new ethers.Interface(this.abi);

      const decodedData = iface.decodeFunctionData(this.method, trx.data);

      const receiver = decodedData.to;
      const amount = decodedData.value;

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
      return [tokenAddress, amount];
    },
  },
});


const subscriptions: Map<
  string,
  { filter: EventType; listener: (l: any) => Promise<unknown[] | undefined> }
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
}: {
  triggerId: string;
  intentId: string;
  address: string;
  provider: JsonRpcProvider;
}) {
  const key = getSubscriptionKey({ triggerId, intentId });
  clearSubscription({ triggerId, intentId, provider })

  const trigger = getTriggers({ address, provider })[
    triggerId as keyof ReturnType<typeof getTriggers>
  ];
  const listener = async (log: any) => {
    console.log(
      `Event received for triggerId: ${triggerId}, intentId: ${intentId}`
    );

    const res = await trigger.proccessLog(log);

    return res;
  };
  provider.on(trigger.filter, listener);
  subscriptions.set(key, { filter: trigger.filter, listener });
}

const sepoliaProvider = provider["11155111"];

export const WalletSign = ({ userId }: { userId?: string | null }) => {
  const { socket } = useSocket();
  const secureLocalStorage = useSecureStorage();
  useEffect(() => {
    if (!socket) return;
    if (!userId) return;

    // Listen for sign requests
    socket.on("signRequest", async ({ message, encodedValues, intentId }) => {
      if (!secureLocalStorage?.address) {
        alert("No wallet found!");
        return;
      }

      const signature = await secureLocalStorage.signMessage(
        isBytesLike(message) ? getBytes(message) : message
      );

      socket.emit("signedMessage", {
        userId: Number(userId),
        signature,
        encodedValues,
        intentId,
      });
      console.log({ signature, encodedValues, intentId, message });
    });

    socket.on(
      "activateTrigger",
      async ({ triggerId, intentId, encodedValues }) => {
        console.log({ triggerId, intentId, encodedValues });
        if (!secureLocalStorage?.address) {
          alert("No wallet found!");
          return;
        }

        addSubscription({
          triggerId,
          intentId,
          address: secureLocalStorage.address,
          provider: sepoliaProvider,
        });
      }
    );

    socket.on(
      "removeTrigger",
      async ({ triggerId, intentId }) => {
        console.log({ remove: true, triggerId, intentId });
        if (!secureLocalStorage?.address) {
          alert("No wallet found!");
          return;
        }

        clearSubscription({
          triggerId,
          intentId,
          provider: sepoliaProvider,
        });
      }
    );
    return () => {
      socket.off("signRequest");
      socket.off("activateTrigger");
      socket.off("removeTrigger");
    };
  }, [socket, userId, secureLocalStorage]);


  return null; // This component doesn't render anything
};
