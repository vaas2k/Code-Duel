import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface userStats {
    rating: number
    wins: number
    losses: number
    draws: number
    total: number
    winRate :number
    setUserStats: (stats: Partial<userStats>) => void
    remUserStats: () => void
}

const useStats = create<userStats>()(
    persist(
        (set, get) => ({
            rating: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            total: 0,
            winRate: 0,
            setUserStats: (stats: Partial<userStats>) => {
                const currentState = get();
                const updatedStats = { ...currentState, ...stats };
                
                // Calculate winRate based on wins and total if needed
                if (stats.wins !== undefined || stats.total !== undefined) {
                    updatedStats.winRate = updatedStats.total > 0 
                        ? (updatedStats.wins / updatedStats.total) * 100 
                        : 0;
                }
                
                set(updatedStats);
            },
            remUserStats: () => set({ 
                rating: 0, 
                wins: 0, 
                losses: 0, 
                draws: 0, 
                total: 0,
                winRate: 0 
            })
        }),
        {
            name: "user-stats", // name for the localStorage key
            // storage: createJSONStorage(() => localStorage), // use localStorage (default)
            // Optional: Use sessionStorage instead:
            storage: createJSONStorage(() => sessionStorage),
            
            // Optional: Only persist specific fields
            partialize: (state) => ({
                rating: state.rating,
                wins: state.wins,
                losses: state.losses,
                draws: state.draws,
                total: state.total,
                winRate: state.winRate
            }),
            
            // Optional: Versioning for migrations
            // version: 1,
            
            // Optional: Migration function if you change the store structure
            // migrate: (persistedState, version) => {
            //     if (version === 0) {
            //         // migrate from version 0 to 1
            //     }
            //     return persistedState as userStats;
            // }
        }
    )
);

export default useStats;