import { create } from 'zustand';



interface MarathonMatch {
    id: number;
    userID: string;
    problems: any[];
    total_time: string;
    status: string;
    setMarathon: (matchData: any) => void;
    getProblemID: () => any;
    updateMarathon: (matchData: any) => void;
    updateProblemTime: (problemID: any, timeTaken: any) => void;
    updateProblems : (problem : any) => void;
    clearMarathon: () => void;
}

const useMarathon = create<MarathonMatch>((set, get) => ({
    id: 0,
    userID: '',
    problems: [],
    total_time: '',
    status: '',
    setMarathon: (matchData: any) => {
        
        console.log(matchData);
        set(
            {
                id: matchData.id,
                userID: matchData.userID,
                problems: matchData.problems,
                total_time: matchData.total_time,
                status: matchData.status
            }
        );
    },
    getProblemID : () => {
        const problems = get().problems;
        console.log(problems);
        if (problems.length > 0 ) {
            return problems[problems.length - 1].id;
        }
        return null;
    },
    updateProblems : (problem :any) => {
        const getProblems = get().problems;
        set({
            problems : [...getProblems, problem]
        })
    },
    updateProblemTime: (problemID: any, timeTaken: any) => {
        const problems = get().problems;
        const updatedProblems = problems.map((problem) => {
            if (problem.id === problemID) {
                return { ...problem, time_taken: timeTaken };
            }
            return problem;
        });

        set({ problems: updatedProblems });
        return updatedProblems;
    },
    updateMarathon: (matchData: any) => set({ id: matchData.id, userID: matchData.userID, problems: matchData.problems, total_time: matchData.total_time, status: matchData.status }),
    clearMarathon: () => set({ id: 0, userID: '', problems: [], total_time: '', status: '' }),
}));

export default useMarathon;