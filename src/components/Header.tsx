import {useEffect, useState} from "react";
import {LogOut, Menu, Plus, Shield, X} from "lucide-react";
import {useNavigate} from "react-router";

import {
    getCurrentUser,
    logout
} from "../services/authService";

import type {
    CurrentUser
} from "../services/authService";


// LOG IN -> HEADER LOADS -> GET CURRENT USER
// USER MENU SHOWS ADMIN PANEL ONLY TO ADMIN USERS

const Header = () => {

    const navigate = useNavigate();

    const [user, setUser] = useState<CurrentUser | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);


    useEffect(() => {

        const loadUser = async () => {

            try {

                const loggedInUser = await getCurrentUser();

                setUser(loggedInUser);

            } catch {

                logout();

                navigate("/login");
            }
        }


        loadUser();

    }, [navigate]);


    const navigateTo = (path: string) => {

        setMenuOpen(false);

        navigate(path);
    }


    // LOGOUT FUNCTION: CLEAR LOCAL STORAGE AND REDIRECT TO LOGIN PAGE
    const handleLogout = () => {

        logout();

        navigate("/login");
    }


    return (
        <header className="border-b border-border bg-[#111318]">

            <div className="mx-auto flex h-14 max-w-375 items-center justify-between px-6">

                <button
                    onClick={() => navigateTo("/")}
                    className="cursor-pointer"
                >
                    <span className="text-sm font-semibold text-gray-200">
                        Army Builder
                    </span>
                </button>


                <div className="flex items-center gap-5 text-gray-400">

                    {user && (
                        <span className="text-sm text-gray-300">
                            {user.username}
                        </span>
                    )}


                    <div className="relative flex items-center">

                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            title="Menu"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center hover:text-white"
                        >
                            {menuOpen ? (
                                <X size={20}/>
                            ) : (
                                <Menu size={20}/>
                            )}
                        </button>


                        {menuOpen && (

                            <div
                                className="absolute right-0 top-9 z-50 w-52 overflow-hidden rounded-lg border border-gray-700 bg-card shadow-xl"
                            >

                                <button
                                    onClick={() => navigateTo("/")}
                                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                                >
                                    <Menu size={17}/>

                                    My Armies
                                </button>


                                <button
                                    onClick={() => navigateTo("/armies/create")}
                                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                                >
                                    <Plus size={17}/>

                                    Create Army
                                </button>


                                {user?.role === "ADMIN" && (

                                    <button
                                        onClick={() => navigateTo("/admin")}
                                        className="flex w-full cursor-pointer items-center gap-3 border-t border-gray-700 px-4 py-3 text-left text-sm text-yellow-400 hover:bg-white/5"
                                    >
                                        <Shield size={17}/>

                                        Admin Panel
                                    </button>
                                )}

                            </div>
                        )}

                    </div>


                    <button
                        onClick={handleLogout}
                        title="Logout"
                        className="flex cursor-pointer items-center gap-2 hover:text-red-400"
                    >
                        <LogOut size={20}/>

                        <span className="text-sm">
                            Logout
                        </span>
                    </button>

                </div>

            </div>

        </header>
    )
}


export default Header;

