import { useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import {  getBytes } from "ethers";
import { useSecureStorage } from "../context/SecureStorageProvider";


export const WalletSign = ({ userId }: { userId?: string | null }) => {
  const { socket } = useSocket();
  const secureLocalStorage = useSecureStorage()
  useEffect(() => {
    if (!socket) return;
    if (!userId) return;

    // Listen for sign requests
    socket.on("signRequest", async ({ message, encodedValues, intentId  }) => {
      if (!secureLocalStorage?.address) {
        alert("No wallet found!");
        return;
      }

      const signature = await secureLocalStorage.signMessage(getBytes(message));

      socket.emit("signedMessage", { userId: Number(userId), signature, encodedValues, intentId  });
      console.log({ signature, encodedValues, intentId, message  });
    });

    return () => {
      socket.off("signRequest");
    };
  }, [socket, userId, secureLocalStorage]);

  return null; // This component doesn't render anything
};
