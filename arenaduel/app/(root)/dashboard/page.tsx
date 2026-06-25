'use client';
import React , {useState, useEffect} from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { User } from "@/types/types";
import { useUserState } from "@/store/useUser";
import useSocket from "@/store/useSocket";

const Page = () => {
    const user = useUserState((state) => state.user);
    const { socket,isConnected,initializeSocket } = useSocket();
    // console.log(user);

    useEffect(() => {   
        if(user && !isConnected){
            initializeSocket(user);
        }
    },[isConnected,user]);

    return (
        <Dashboard />
    )
};

export default Page;