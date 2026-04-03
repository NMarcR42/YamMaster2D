import React, { createContext, useState, useEffect } from "react";
import io from "socket.io-client";

const socketEndpoint = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// Création de l'instance
export const socket = io(socketEndpoint, {
  transports: ["websocket"],
  autoConnect: true, // Changé à true pour simplifier, ou appeler .connect()
});

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() { setIsConnected(true); }
    function onDisconnect() { setIsConnected(false); }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Si autoConnect était false, il faudrait faire socket.connect() ici
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, user, setUser, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};