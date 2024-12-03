import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSecureStorage } from "./SecureStorageProvider";
import { SCHEMA } from "../utils/secureStorage";

interface SocketContextProps {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextProps>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{
  userId?: number;
  children: React.ReactNode;
}> = ({ userId, children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const secureLocalStorage = useSecureStorage();
  useEffect(() => {
    // Initialize Socket.IO client
    if (!userId) return;
    if (!secureLocalStorage?.address) return;

    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000",
      {
        transports: ["websocket"],
      }
    );

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      // Emit 'init' event with userId
      newSocket.emit("init", {
        userId,
        wallet: secureLocalStorage?.address,
        vault: secureLocalStorage?.vault,
      });

      const triggers = secureLocalStorage?.getTriggersData(SCHEMA.TRIGGER)
      if (!triggers) return

      Object.keys(triggers).forEach((key) => {
        const trigger = triggers[key]
        newSocket.emit("reconnectTrigger", trigger)
      })
    });

  }, [userId, secureLocalStorage?.address, secureLocalStorage?.vault]);

  useEffect(() => {
    return () => {
      // @ts-expect-error: Telegram
      window?.Telegram?.WebApp?.expand()
      //socket?.disconnect();
      //setSocket(null);
    };
  }, [])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
