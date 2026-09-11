import {useEffect, useState} from "react";
import {Navigate, Outlet} from "react-router";

import {
    getCurrentUser
} from "../services/authService";

import type {
    CurrentUser
} from "../services/authService";



const AdminRoute = () => {

    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const checkAdmin = async () => {

            try {

                const loggedInUser = await getCurrentUser();

                setUser(loggedInUser);

            } catch {

                setUser(null);

            } finally {

                setLoading(false);
            }
        }


        checkAdmin();

    }, []);


    if (loading) {

        return (
            <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background text-gray-400">
                Checking authorization...
            </div>
        )
    }


    // IF the user is not an admin, redirect to the home page, even if they manualy type http://localhost:5173/admin
    if (!user || user.role !== "ADMIN") {

        return (                   
            <Navigate          
                to="/"
                replace
            />
        )
    }


    return <Outlet/>;
}


export default AdminRoute;

