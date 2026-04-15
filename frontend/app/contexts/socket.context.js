import React, { createContext, useState, useEffect } from "react";
import { Platform } from "react-native";
import io from "socket.io-client";

// Si on est sur Web (navigateur), localhost suffit. 
// Si on est sur Mobile, on a besoin de l'IP, sinon fallback sur localhost.
const defaultEndpoint = Platform.OS === 'web' ? 'http://localhost:3005' : 'http://127.0.0.1:3005';

const socketEndpoint = process.env.EXPO_PUBLIC_API_URL || defaultEndpoint;

// Création de l'instance
export const socket = io(socketEndpoint, {
  transports: ["websocket"],
  autoConnect: true, 
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