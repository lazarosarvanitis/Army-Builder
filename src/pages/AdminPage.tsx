import {useEffect, useState} from "react";
import type {SubmitEvent} from "react";

import {
    Pencil,
    Plus,
    Save,
    Search,
    ShieldCheck,
    Trash2,
    Users,
    X
} from "lucide-react";

import {
    createDetachment,
    createFaction,
    createUnit,
    deleteDetachment,
    deleteFaction,
    deleteUnit,
    getAllDetachments,
    getAllFactions,
    getAllUnits,
    getAllUsers,
    promoteUser,
    demoteUser,
    updateUnit
} from "../services/adminService";

import type {
    DetachmentResponse,
    FactionResponse,
    UnitResponse
} from "../services/armyService";

import type {
    AdminUserResponse
} from "../services/adminService";


const UNIT_TYPES = [
    "Character",
    "Battleline",
    "Infantry",
    "Mounted",
    "Vehicle",
    "Monster",
    "Aspect Warriors"
];


const AdminPage = () => {

    // DATA

    const [factions, setFactions] = useState<FactionResponse[]>([]);
    const [detachments, setDetachments] = useState<DetachmentResponse[]>([]);
    const [units, setUnits] = useState<UnitResponse[]>([]);
    const [users, setUsers] = useState<AdminUserResponse[]>([]);


    // FACTION FORM

    const [factionName, setFactionName] = useState("");


    // DETACHMENT FORM

    const [detachmentName, setDetachmentName] = useState("");
    const [detachmentFactionId, setDetachmentFactionId] = useState<number>(0);


    // UNIT FORM

    const [unitName, setUnitName] = useState("");
    const [unitType, setUnitType] = useState("");
    const [unitPoints, setUnitPoints] = useState("");
    const [unitFactionId, setUnitFactionId] = useState<number>(0);


    // UNIT EDIT STATE

    const [editingUnitId, setEditingUnitId] = useState<number | null>(null);


    // UNIT SEARCH

    const [unitSearch, setUnitSearch] = useState("");


    // PAGE STATE

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    const loadData = async () => {

        try {

            const [
                factionData,
                detachmentData,
                unitData,
                userData
            ] = await Promise.all([
                getAllFactions(),
                getAllDetachments(),
                getAllUnits(),
                getAllUsers()
            ]);

            setFactions(factionData);
            setDetachments(detachmentData);
            setUnits(unitData);
            setUsers(userData);


            if (factionData.length > 0) {

                setDetachmentFactionId((current) =>
                    current === 0
                        ? factionData[0].id
                        : current
                );

                setUnitFactionId((current) =>
                    current === 0
                        ? factionData[0].id
                        : current
                );
            }

        } catch (loadError) {

            if (loadError instanceof Error) {
                setError(loadError.message);
            } else {
                setError("Could not load admin data");
            }

        } finally {

            setLoading(false);
        }
    }


    useEffect(() => {

        loadData();

    }, []);


    const clearMessages = () => {

        setError("");
        setSuccess("");
    }


    const getFactionName = (factionId: number) => {

        return factions.find(
            (faction) => faction.id === factionId
        )?.name ?? "Unknown Faction";
    }


    const resetUnitForm = () => {

        setUnitName("");
        setUnitType("");
        setUnitPoints("");
        setEditingUnitId(null);

        if (factions.length > 0) {
            setUnitFactionId(factions[0].id);
        }
    }


    // UNIT SORTING AND SEARCH

    const sortedFilteredUnits = [...units]
        .sort((a, b) => {

            const factionAIndex = factions.findIndex(
                (faction) => faction.id === a.faction_id
            );

            const factionBIndex = factions.findIndex(
                (faction) => faction.id === b.faction_id
            );


            if (factionAIndex !== factionBIndex) {
                return factionAIndex - factionBIndex;
            }

            return a.name.localeCompare(b.name);
        }) 
        .filter((unit) => {

            const search = unitSearch.toLowerCase().trim();

            if (search === "") {
                return true;
            }

            const factionName = getFactionName(
                unit.faction_id
            ).toLowerCase();

            return (
                unit.name.toLowerCase().includes(search) ||
                unit.type.toLowerCase().includes(search) ||
                factionName.includes(search)
            );
        });


    // USER SORTING

    const sortedUsers = [...users].sort((a, b) => {

    if (a.role !== b.role) {

        if (a.role === "ADMIN") {
            return -1;
        }

        if (b.role === "ADMIN") {
            return 1;
        }
    }

    return a.username.localeCompare(
        b.username
    );
});


    // USER HANDLERS

    const handlePromoteUser = async (
        user: AdminUserResponse
    ) => {

        const confirmed = window.confirm(
            `Promote "${user.username}" to administrator?`
        );

        if (!confirmed) {
            return;
        }

        clearMessages();

        try {

            await promoteUser(
                user.id
            );

            setSuccess(
                `${user.username} was promoted to administrator. They must log in again for the new role to take effect.`
            );

            await loadData();

        } catch (promoteError) {

            if (promoteError instanceof Error) {
                setError(promoteError.message);
            }
        }
    }


    const handleDemoteUser = async (
        user: AdminUserResponse
    ) => {

        const confirmed = window.confirm(
            `Demote "${user.username}" to a normal user?`
        );

        if (!confirmed) {
            return;
        }

        clearMessages();

        try {

            await demoteUser(
                user.id
            );

            setSuccess(
                `${user.username} was demoted to USER. Their existing administrator access is no longer valid.`
            );

            await loadData();

        } catch (demoteError) {

            if (demoteError instanceof Error) {

                if (
                    demoteError.message ===
                    "You cannot demote your own administrator account"
                ) {
                    window.alert(
                        demoteError.message
                    );

                    return;
                }

                setError(
                    demoteError.message
                );
            }
        }
    }


    // FACTION HANDLERS

    const handleCreateFaction = async (
        event: SubmitEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        clearMessages();

        if (factionName.trim() === "") {
            setError("Faction name is required");
            return;
        }

        try {

            await createFaction(
                factionName.trim()
            );

            setFactionName("");

            setSuccess("Faction created successfully.");

            await loadData();

        } catch (createError) {

            if (createError instanceof Error) {
                setError(createError.message);
            }
        }
    }


    const handleDeleteFaction = async (
        faction: FactionResponse
    ) => {

        const confirmed = window.confirm(
            `Delete faction "${faction.name}"?`
        );

        if (!confirmed) {
            return;
        }

        clearMessages();

        try {

            await deleteFaction(faction.id);

            setSuccess("Faction deleted successfully.");

            await loadData();

        } catch (deleteError) {

            if (deleteError instanceof Error) {
                setError(deleteError.message);
            }
        }
    }


    // DETACHMENT HANDLERS

    const handleCreateDetachment = async (
        event: SubmitEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        clearMessages();

        if (detachmentName.trim() === "") {
            setError("Detachment name is required");
            return;
        }

        if (detachmentFactionId === 0) {
            setError("A faction is required");
            return;
        }

        try {

            await createDetachment(
                detachmentName.trim(),
                detachmentFactionId
            );

            setDetachmentName("");

            setSuccess("Detachment created successfully.");

            await loadData();

        } catch (createError) {

            if (createError instanceof Error) {
                setError(createError.message);
            }
        }
    }


    const handleDeleteDetachment = async (
        detachment: DetachmentResponse
    ) => {

        const confirmed = window.confirm(
            `Delete detachment "${detachment.name}"?`
        );

        if (!confirmed) {
            return;
        }

        clearMessages();

        try {

            await deleteDetachment(detachment.id);

            setSuccess("Detachment deleted successfully.");

            await loadData();

        } catch (deleteError) {

            if (deleteError instanceof Error) {
                setError(deleteError.message);
            }
        }
    }


    // UNIT HANDLERS

    const handleSubmitUnit = async (
        event: SubmitEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        clearMessages();

        if (unitName.trim() === "") {
            setError("Unit name is required");
            return;
        }

        if (unitType === "") {
            setError("Unit type is required");
            return;
        }

        const points = Number(unitPoints);

        if (!Number.isInteger(points) || points <= 0) {
            setError("Unit points must be greater than 0");
            return;
        }

        if (unitFactionId === 0) {
            setError("A faction is required");
            return;
        }

        try {

            if (editingUnitId !== null) {

                await updateUnit(
                    editingUnitId,
                    unitName.trim(),
                    unitType,
                    points,
                    unitFactionId
                );

                setSuccess("Unit updated successfully.");

            } else {

                await createUnit(
                    unitName.trim(),
                    unitType,
                    points,
                    unitFactionId
                );

                setSuccess("Unit created successfully.");
            }

            resetUnitForm();

            await loadData();

        } catch (unitError) {

            if (unitError instanceof Error) {
                setError(unitError.message);
            }
        }
    }


    const handleEditUnit = (
        unit: UnitResponse
    ) => {

        clearMessages();

        setEditingUnitId(unit.id);
        setUnitName(unit.name);
        setUnitType(unit.type);
        setUnitPoints(String(unit.points));
        setUnitFactionId(unit.faction_id);
    }


    const handleCancelEdit = () => {

        clearMessages();

        resetUnitForm();
    }


    const handleDeleteUnit = async (
        unit: UnitResponse
    ) => {

        const confirmed = window.confirm(
            `Delete unit "${unit.name}"?`
        );

        if (!confirmed) {
            return;
        }

        clearMessages();

        try {

            await deleteUnit(unit.id);

            if (editingUnitId === unit.id) {
                resetUnitForm();
            }

            setSuccess("Unit deleted successfully.");

            await loadData();

        } catch (deleteError) {

            if (deleteError instanceof Error) {
                setError(deleteError.message);
            }
        }
    }


    if (loading) {

        return (
            <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-background text-gray-400">
                Loading admin panel...
            </main>
        )
    }


    return (
        <main className="min-h-[calc(100vh-3.5rem)] bg-background px-6 py-10 text-white">

            <div className="mx-auto max-w-350">

                {/* PAGE HEADER */}

                <div className="mb-8">

                    <div className="mb-2 flex items-center gap-3">

                        <ShieldCheck
                            size={28}
                            className="text-yellow-400"
                        />

                        <h1 className="text-2xl font-semibold">
                            Admin Panel
                        </h1>

                    </div>

                    <p className="text-sm text-gray-400">
                        Manage factions, detachments, units and administrator access.
                    </p>


                    <div className="mt-5 rounded-xl border border-green-900/50 bg-green-950/20 p-4">

                        <div className="flex items-center gap-3">

                            <ShieldCheck
                                size={20}
                                className="text-green-400"
                            />

                            <div>

                                <p className="text-sm font-medium text-green-400">
                                    Administrator authorization confirmed
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    These operations use backend endpoints restricted to the ADMIN role.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* STATUS MESSAGES */}

                {error && (

                    <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}


                {success && (

                    <div className="mb-6 rounded-lg border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-300">
                        {success}
                    </div>
                )}


                <div className="grid gap-6 xl:grid-cols-3">

                    {/* FACTIONS */}

                    <section className="rounded-xl border border-gray-800 bg-[#15181d]">

                        <div className="border-b border-gray-800 p-5">

                            <h2 className="font-semibold text-gray-100">
                                Factions
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Create and remove army factions.
                            </p>

                        </div>


                        <form
                            onSubmit={handleCreateFaction}
                            className="border-b border-gray-800 p-5"
                        >

                            <label className="mb-2 block text-xs font-medium text-gray-400">
                                Faction Name
                            </label>

                            <input
                                type="text"
                                value={factionName}
                                onChange={(event) =>
                                    setFactionName(event.target.value)
                                }
                                placeholder="Example: Space Marines"
                                className="mb-3 w-full rounded-lg border border-gray-700 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 outline-none focus:border-gray-500"
                            />

                            <button
                                type="submit"
                                className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-200"
                            >
                                <Plus size={16}/>

                                Add Faction
                            </button>

                        </form>


                        <div className="max-h-105 overflow-y-auto p-3">

                            {factions.map((faction) => (

                                <div
                                    key={faction.id}
                                    className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-white/5"
                                >

                                    <div>

                                        <p className="text-sm text-gray-200">
                                            {faction.name}
                                        </p>

                                        {/* IF WE WANT ADMIN TO KNOW FACTION ID
                                        <p className="text-xs text-gray-600">
                                            ID: {faction.id}
                                        </p> */}

                                    </div>


                                    <button
                                        onClick={() =>
                                            handleDeleteFaction(faction)
                                        }
                                        title="Delete faction"
                                        className="cursor-pointer text-gray-600 hover:text-red-400"
                                    >
                                        <Trash2 size={17}/>
                                    </button>

                                </div>
                            ))}

                        </div>

                    </section>


                    {/* DETACHMENTS */}

                    <section className="rounded-xl border border-gray-800 bg-[#15181d]">

                        <div className="border-b border-gray-800 p-5">

                            <h2 className="font-semibold text-gray-100">
                                Detachments
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Create detachments for a faction.
                            </p>

                        </div>


                        <form
                            onSubmit={handleCreateDetachment}
                            className="border-b border-gray-800 p-5"
                        >

                            <label className="mb-2 block text-xs font-medium text-gray-400">
                                Detachment Name
                            </label>

                            <input
                                type="text"
                                value={detachmentName}
                                onChange={(event) =>
                                    setDetachmentName(event.target.value)
                                }
                                placeholder="Detachment name"
                                className="mb-3 w-full rounded-lg border border-gray-700 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 outline-none focus:border-gray-500"
                            />


                            <label className="mb-2 block text-xs font-medium text-gray-400">
                                Faction
                            </label>

                            <select
                                value={detachmentFactionId}
                                onChange={(event) =>
                                    setDetachmentFactionId(
                                        Number(event.target.value)
                                    )
                                }
                                className="mb-3 w-full rounded-lg border border-gray-700 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 outline-none focus:border-gray-500"
                            >

                                {factions.map((faction) => (

                                    <option
                                        key={faction.id}
                                        value={faction.id}
                                    >
                                        {faction.name}
                                    </option>
                                ))}

                            </select>


                            <button
                                type="submit"
                                className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-200"
                            >
                                <Plus size={16}/>

                                Add Detachment
                            </button>

                        </form>


                        <div className="max-h-105 overflow-y-auto p-3">

                            {detachments.map((detachment) => (

                                <div
                                    key={detachment.id}
                                    className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-white/5"
                                >

                                    <div>

                                        <p className="text-sm text-gray-200">
                                            {detachment.name}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {getFactionName(detachment.faction_id)}
                                        </p>

                                    </div>


                                    <button
                                        onClick={() =>
                                            handleDeleteDetachment(detachment)
                                        }
                                        title="Delete detachment"
                                        className="cursor-pointer text-gray-600 hover:text-red-400"
                                    >
                                        <Trash2 size={17}/>
                                    </button>

                                </div>
                            ))}

                        </div>

                    </section>


                    {/* UNITS */}

                    <section className="rounded-xl border border-gray-800 bg-[#15181d]">

                        <div className="border-b border-gray-800 p-5">

                            <h2 className="font-semibold text-gray-100">
                                Units
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                {editingUnitId !== null
                                    ? "Update the selected unit."
                                    : "Create units and assign their points."
                                }
                            </p>

                        </div>


                        <form
                            onSubmit={handleSubmitUnit}
                            className="border-b border-gray-800 p-5"
                        >

                            {editingUnitId !== null && (

                                <div className="mb-4 rounded-lg border border-yellow-900/50 bg-yellow-950/20 px-3 py-2">

                                    <p className="text-xs font-medium text-yellow-400">
                                        Editing Unit
                                    </p>

                                    <p className="mt-1 text-sm text-gray-300">
                                        Change the values below and save your changes.
                                    </p>

                                </div>
                            )}


                            <label className="mb-2 block text-xs font-medium text-gray-400">
                                Unit Name
                            </label>

                            <input
                                type="text"
                                value={unitName}
                                onChange={(event) =>
                                    setUnitName(event.target.value)
                                }
                                placeholder="Unit name"
                                className="mb-3 w-full rounded-lg border border-gray-700 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 outline-none focus:border-gray-500"
                            />


                            <label className="mb-2 block text-xs font-medium text-gray-400">
                                Type
                            </label>

                            <select
                                value={unitType}
                                onChange={(event) =>
                                    setUnitType(event.target.value)
                                }
                                className="mb-3 w-full rounded-lg border border-gray-700 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 outline-none focus:border-gray-500"
                            >

                                <option value="">
                                    Select unit type
                                </option>

                                {UNIT_TYPES.map((type) => (

                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>
                                ))}

                            </select>


                            <label className="mb-2 block text-xs font-medium text-gray-400">
                                Points
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={unitPoints}
                                onChange={(event) =>
                                    setUnitPoints(event.target.value)
                                }
                                placeholder="100"
                                className="mb-3 w-full rounded-lg border border-gray-700 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 outline-none focus:border-gray-500"
                            />


                            <label className="mb-2 block text-xs font-medium text-gray-400">
                                Faction
                            </label>

                            <select
                                value={unitFactionId}
                                onChange={(event) =>
                                    setUnitFactionId(
                                        Number(event.target.value)
                                    )
                                }
                                className="mb-3 w-full rounded-lg border border-gray-700 bg-[#0f1115] px-3 py-2 text-sm text-gray-200 outline-none focus:border-gray-500"
                            >

                                {factions.map((faction) => (

                                    <option
                                        key={faction.id}
                                        value={faction.id}
                                    >
                                        {faction.name}
                                    </option>
                                ))}

                            </select>


                            <div className="flex gap-2">

                                <button
                                    type="submit"
                                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-gray-200"
                                >

                                    {editingUnitId !== null ? (
                                        <Save size={16}/>
                                    ) : (
                                        <Plus size={16}/>
                                    )}

                                    {editingUnitId !== null
                                        ? "Save Changes"
                                        : "Add Unit"
                                    }

                                </button>


                                {editingUnitId !== null && (

                                    <button
                                        type="button"
                                        onClick={handleCancelEdit}
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                                    >
                                        <X size={16}/>

                                        Cancel
                                    </button>
                                )}

                            </div>

                        </form>


                        {/* UNIT SEARCH */}

                        <div className="border-b border-gray-800 p-4">

                            <div className="relative">

                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                />

                                <input
                                    type="text"
                                    value={unitSearch}
                                    onChange={(event) =>
                                        setUnitSearch(event.target.value)
                                    }
                                    placeholder="Search units..."
                                    className="w-full rounded-lg border border-gray-700 bg-[#0f1115] py-2 pl-9 pr-9 text-sm text-gray-200 outline-none focus:border-gray-500"
                                />


                                {unitSearch !== "" && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setUnitSearch("")
                                        }
                                        title="Clear search"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-white"
                                    >
                                        <X size={16}/>
                                    </button>
                                )}

                            </div>

                        </div>


                        {/* UNIT LIST */}

                        <div className="max-h-125 overflow-y-auto p-3">

                            {sortedFilteredUnits.length === 0 && (

                                <p className="px-3 py-5 text-center text-sm text-gray-500">
                                    No units found.
                                </p>
                            )}


                            {sortedFilteredUnits.map((unit, index) => {

                                const factionName = getFactionName(
                                    unit.faction_id
                                );

                                const previousUnit = index > 0
                                    ? sortedFilteredUnits[index - 1]
                                    : null;

                                const previousFactionId = previousUnit
                                    ? previousUnit.faction_id
                                    : null;

                                const showFactionHeader =
                                    previousFactionId !== unit.faction_id;


                                return (

                                    <div key={unit.id}>

                                        {showFactionHeader && (

                                            <div className="mb-1 mt-3 border-b border-gray-800 px-3 pb-2 first:mt-0">

                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    {factionName}
                                                </p>

                                            </div>
                                        )}


                                        <div
                                            className={`flex items-center justify-between rounded-lg px-3 py-3 hover:bg-white/5 ${
                                                editingUnitId === unit.id
                                                    ? "bg-yellow-950/20"
                                                    : ""
                                            }`}
                                        >

                                            <div>

                                                <p className="text-sm text-gray-200">
                                                    {unit.name}
                                                </p>

                                                <p className="text-xs text-gray-500">
                                                    {unit.type}
                                                    {" · "}
                                                    {unit.points} pts
                                                </p>

                                            </div>


                                            <div className="flex items-center gap-3">

                                                <button
                                                    onClick={() =>
                                                        handleEditUnit(unit)
                                                    }
                                                    title="Edit unit"
                                                    className="cursor-pointer text-gray-600 hover:text-yellow-400"
                                                >
                                                    <Pencil size={17}/>
                                                </button>


                                                <button
                                                    onClick={() =>
                                                        handleDeleteUnit(unit)
                                                    }
                                                    title="Delete unit"
                                                    className="cursor-pointer text-gray-600 hover:text-red-400"
                                                >
                                                    <Trash2 size={17}/>
                                                </button>

                                            </div>

                                        </div>

                                    </div>
                                )
                            })}

                        </div>

                    </section>

                </div>


                {/* USERS */}

                <section className="mt-6 rounded-xl border border-gray-800 bg-[#15181d]">

                    <div className="border-b border-gray-800 p-5">

                        <div className="flex items-center gap-3">

                            <Users
                                size={20}
                                className="text-yellow-400"
                            />

                            <div>

                                <h2 className="font-semibold text-gray-100">
                                    Users
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Promote registered users to administrator.
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="p-3">

                        {sortedUsers.length === 0 && (

                            <p className="px-3 py-5 text-center text-sm text-gray-500">
                                No users found.
                            </p>
                        )}


                        {sortedUsers.map((user) => (

                            <div
                                key={user.id}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-lg px-3 py-3 hover:bg-white/5"
                            >

                                <div>

                                    <div className="flex flex-wrap items-center gap-2">

                                        <p className="text-sm text-gray-200">
                                            {user.username}
                                        </p>

                                        <span
                                            className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                                user.role === "ADMIN"
                                                    ? "bg-yellow-950/40 text-yellow-400"
                                                    : "bg-gray-800 text-gray-400"
                                            }`}
                                        >
                                            {user.role}
                                        </span>

                                    </div>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {user.email}
                                    </p>

                                </div>


                                {user.role === "USER" ? (

                                    <button
                                        onClick={() =>
                                            handlePromoteUser(user)
                                        }
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-yellow-900/60 px-3 py-2 text-sm text-yellow-400 hover:bg-yellow-950/30"
                                    >
                                        <ShieldCheck size={16}/>

                                        Make Admin
                                    </button>

                                ) : (

                                    <button
                                        onClick={() =>
                                            handleDemoteUser(user)
                                        }
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-900/60 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30"
                                    >
                                        <ShieldCheck size={16}/>

                                        Demote to User
                                    </button>

                                )}

                            </div>
                        ))}

                    </div>

                </section>

            </div>

        </main>
    )
}


export default AdminPage;

