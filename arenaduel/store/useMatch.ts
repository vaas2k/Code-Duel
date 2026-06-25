import { User } from '@/types/types';
import { create } from 'zustand';



interface MatchState {
    roomID: string,
    problemID: number;
    player1: {
        username: string;
        userID: string;
        rating: number;
        casesPassed: number
        win: boolean
        lose: boolean
        language: string;
    }
    player2: {
        username: string;
        userID: string;
        rating: number;
        casesPassed: number;
        win: boolean
        lose: boolean;
        language: string;
    }
    totalCases: number;
    solution: string;
    matchData: any;
    setMatchState: (state: Partial<MatchState>) => void;
    resetMatchState: () => void;
    getMatchState: () => MatchState;
}


const useMatchStore = create<MatchState>((set, get) => ({
    roomID: '',
    problemID: 0,
    player1: {
        username: '',
        userID: '',
        rating: 0,
        casesPassed: 0,
        win: false,
        lose: false,
        language: ''
    },
    player2: {
        username: '',
        userID: '',
        rating: 0,
        casesPassed: 0,
        win: false,
        lose: false,
        language: ''
    },
    totalCases: 0,
    solution: '',
    matchData: null,
    setMatchState: (data: any) => {
        // console.log("Setting Match State"  , data);
        set({ ...data });

    },
    resetMatchState: () => {
        useMatchStore.setState({
            roomID: '',
            problemID: 0,
            player1: {
                username: '',
                userID: '',
                rating: 0,
                casesPassed: 0,
                win: false,
                lose: false,
                language: ''
            },
            player2: {
                username: '',
                userID: '',
                rating: 0,
                casesPassed: 0,
                win: false,
                lose: false,
                language: ''
            },
            totalCases: 0,
            solution: ''
        })

    },
    getMatchState: () => get()

}))

export default useMatchStore;