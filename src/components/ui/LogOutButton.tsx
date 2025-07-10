'use client';
import React, { useState } from 'react'
import { Button } from './button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner';
import { useRouter } from "next/navigation";
import { logOutAction } from '@/actions/users';

function LogOutButton() {
    const router= useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogOut = async() =>{
        setLoading(true)
        
const {errorMessage }= await logOutAction();


       

        if (!errorMessage) {
  toast.success("Logout Success", {
    description: "You have been successfully logged out.",
  },
);
  router.push("/");
} else {
  toast.error("Logout Failed", {
    description: errorMessage || "Something went wrong.",
  });
}

        setLoading(false);
        console.log("Logging out...");
    };
  return (
    <Button 
    variant="outline"
    onClick={handleLogOut}
    className="w-24">{loading ? <Loader2 className="Animate-spin"/>:"Log Out"}</Button>
  )
}

export default LogOutButton