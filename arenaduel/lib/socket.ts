import { User } from "@/types/types";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const createSocket = (data : User) => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
      transports: ["websocket"],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        id: data?.id, 
        username: data?.username,
        rating: data?.rating,
      }
    });
  }
  return socket;
};
