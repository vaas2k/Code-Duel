import axios from "axios";

export default async function useAutoLogin ()  {

    try {
        // console.log("Auto logging in user:", userID);

        const req = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth-verify`,
         { withCredentials: true });
        
        if(req.status === 200){ 
            return true;
        }

        return false;

    } catch (error) {
        console.error("Auto login failed:", error);
        return false;
    }
}