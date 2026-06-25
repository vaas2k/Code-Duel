import React from "react";
import Navbar from "@/components/Others/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    
    
    return <div className=""> 
        <Navbar />
        {children}
    </div>;
}