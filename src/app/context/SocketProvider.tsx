import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

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

  useEffect(() => {
    // Initialize Socket.IO client
    if (!userId) return;
    
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
      newSocket.emit("init", userId);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};