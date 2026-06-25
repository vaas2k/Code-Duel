import { create } from 'zustand';
import { createSocket } from '@/lib/socket';
import { Socket } from 'socket.io-client';
import { User } from '@/types/types';

interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    initializeSocket: (data : User) => void;
    disconnectSocket: () => void;
}



const useSocket = create<SocketState>((set) => ({
    socket: null,
    isConnected: false,
    initializeSocket: (data : User) => {

        
        const socketInstance = createSocket(data);

        socketInstance.on('connect', () => {
            set({ socket: socketInstance, isConnected: true });
            console.log('Socket connected');
        })

        socketInstance.on('disconnect', () => {
            set({ socket: null, isConnected: false });
            console.log('Socket disconnected');
        })

        set({ socket: socketInstance });
    },
    disconnectSocket: () => {
        set((state) => {
            if (state.socket) {
                state.socket.disconnect();
            }
            return { socket: null, isConnected: false };
        });
    },
}))

export default useSocket ;