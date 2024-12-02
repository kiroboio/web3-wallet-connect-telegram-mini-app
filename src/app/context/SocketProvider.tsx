import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSecureStorage } from "./SecureStorageProvider";

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
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      newSocket.disconnect()
      setSocket(null);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [userId, secureLocalStorage?.address]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
