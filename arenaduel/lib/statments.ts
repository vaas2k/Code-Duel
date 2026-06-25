import axios from "axios";

let statements = [];

const getStatments = async () => {
  try {
    
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-problems`);
    if(res.status === 200) {
      statements = res.data.problems;
    }
  } catch (error) {
    console.error('Error fetching problem statement:', error);
  }
};
