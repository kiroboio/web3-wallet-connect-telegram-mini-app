import { useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useSecureStorage } from "../utils/useSecureStorage";


export const WalletSign = ({ userId }: { userId?: string | null }) => {
  const { socket } = useSocket();
  const secureLocalStorage = useSecureStorage()
  useEffect(() => {
    if (!socket) return;
    if (!userId) return;

    // Listen for sign requests
    socket.on("signRequest", async ({ message }) => {
      if (!secureLocalStorage?.address) {
        alert("No wallet found!");
        return;
      }

      const signature = await secureLocalStorage.signMessage(message);

      console.log({ signature });
      socket.emit("signedMessage", { userId: Number(userId), signature });
    });

    return () => {
      socket.off("signRequest");
    };
  }, [socket, userId, secureLocalStorage]);

  return null; // This component doesn't render anything
};
