import {useEffect, useState} from "react";
import {Plus, Search, X} from "lucide-react";
import {useNavigate} from "react-router";

import ArmyCard from "../components/ArmyCard.tsx";

import {
    getMyArmies
} from "../services/armyService";

import {
    getCurrentUser
} from "../services/authService";

import type {
    ArmyListItem
} from "../services/armyService";


const ArmyListPage = () => {

    const navigate = useNavigate();

    const [armies, setArmies] =
        useState<ArmyListItem[]>([]);

    const [username, setUsername] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showSearch, setShowSearch] =
        useState(false);

    const [search, setSearch] =
        useState("");


    useEffect(() => {

        const loadArmies = async () => {

            try {

                const [
                    armyData,
                    currentUser
                ] = await Promise.all([
                    getMyArmies(),
                    getCurrentUser()
                ]);

                setArmies(armyData);

                setUsername(
                    currentUser.username
                );

            } catch (error) {

                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Could not load armies");
                }

            } finally {
                setLoading(false);
            }
        }


        loadArmies();

    }, []);


    const filteredArmies =
        armies
            .filter((army) => {

                const searchValue =
                    search.toLowerCase();

                return (
                    army.name
                        .toLowerCase()
                        .includes(searchValue) ||

                    army.faction
                        .toLowerCase()
                        .includes(searchValue) ||

                    army.detachment
                        .toLowerCase()
                        .includes(searchValue)
                );
            })
            .sort((a, b) => {

                const factionComparison =
                    a.faction.localeCompare(
                        b.faction
                    );

                if (factionComparison !== 0) {
                    return factionComparison;
                }

                return a.name.localeCompare(
                    b.name
                );
            });


    const handleSearchToggle = () => {

        if (showSearch) {
            setSearch("");
        }

        setShowSearch(
            !showSearch
        );
    }


    return (
        <div className="mx-auto max-w-375 px-6 py-8">

            <div className="mb-8 text-center">

                <h1 className="text-2xl font-semibold">
                    {username
                        ? `${username}'s Army Lists`
                        : "My Army Lists"
                    }
                </h1>

                <p className="mt-1 text-sm text-muted">
                    Build and manage your Warhammer 40,000 army lists.
                </p>

            </div>


            {error && (

                <div className="mb-6 rounded-md border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">
                    {error}
                </div>

            )}


            {showSearch && (

                <div className="relative mx-auto mb-6 max-w-125">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search armies..."
                        autoFocus
                        className="w-full rounded-md border border-border bg-card py-3 pl-10 pr-10 text-white outline-none transition focus:border-gray-500"
                    />

                    {search && (

                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted transition hover:text-white"
                        >
                            <X size={18}/>
                        </button>

                    )}

                </div>

            )}


            <div className="flex flex-wrap justify-center gap-3 pb-5">

                {/* CREATE ARMY */}
                <button
                    onClick={() => navigate("/armies/create")}
                    className="
                        flex h-36.25 w-48 cursor-pointer
                        flex-col items-center justify-center gap-2 rounded-md
                        border border-border bg-card
                        transition hover:bg-card-hover
                    "
                >
                    <Plus
                        size={34}
                        strokeWidth={1.5}
                    />

                    <span className="text-sm font-medium">
                        Create Army
                    </span>
                </button>


                {/* SEARCH */}
                <button
                    onClick={handleSearchToggle}
                    className={`
                        flex h-36 w-48 cursor-pointer
                        flex-col items-center justify-center gap-2 rounded-md
                        border bg-card
                        transition hover:bg-card-hover
                        ${
                            showSearch
                                ? "border-gray-500"
                                : "border-border"
                        }
                    `}
                >
                    {showSearch ? (

                        <>
                            <X
                                size={30}
                                strokeWidth={1.5}
                            />

                            <span className="text-sm font-medium">
                                Close Search
                            </span>
                        </>

                    ) : (

                        <>
                            <Search
                                size={30}
                                strokeWidth={1.5}
                            />

                            <span className="text-sm font-medium">
                                Search Army
                            </span>
                        </>

                    )}
                </button>


                {/* LOADING */}
                {loading && (

                    <div className="
                        flex h-36 w-48
                        items-center justify-center rounded-md
                        border border-border bg-card
                        text-sm text-muted
                    ">
                        Loading armies...
                    </div>

                )}


                {/* EMPTY */}
                {!loading &&
                    !error &&
                    armies.length === 0 && (

                        <div className="
                            flex h-36 w-48
                            items-center justify-center rounded-md
                            border border-border bg-card
                            px-6 text-center text-sm text-muted
                        ">
                            You do not have any armies yet.
                        </div>

                    )}


                {/* NO SEARCH RESULTS */}
                {!loading &&
                    !error &&
                    armies.length > 0 &&
                    filteredArmies.length === 0 && (

                        <div className="
                            flex h-36 w-48
                            items-center justify-center rounded-md
                            border border-border bg-card
                            px-6 text-center text-sm text-muted
                        ">
                            No armies found.
                        </div>

                    )}


                {/* ARMY CARDS */}
                {!loading &&
                    filteredArmies.map((army) => (

                        <ArmyCard
                            key={army.id}
                            id={army.id}
                            name={army.name}
                            faction={army.faction}
                            detachment={army.detachment}
                            points={army.points}
                            pointsLimit={army.pointsLimit}
                        />

                    ))}

            </div>

        </div>
    )
}


export default ArmyListPage;
