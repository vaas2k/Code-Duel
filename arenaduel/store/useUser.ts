import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    username: string;
    email: string;
    rating: number;
    // image : string | null;
    authenticated: boolean;
}

interface UserState {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
    // getUser : () => User | null
}

export const useUserState = create<UserState>()(
    persist(
        (set) => (
            {
                user: null,
                setUser: (user: User) =>{
                        console.log('Setting user:', user);
                        set({ user })
                    },
                clearUser: () => set({ user: null }),

            }
        ),
        {
            name: "user-state-storage", // unique name for localStorage key
        }
    )
);
