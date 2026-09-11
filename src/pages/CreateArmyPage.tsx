import {useEffect, useState} from "react";
import type {SubmitEvent} from "react";

import {useNavigate} from "react-router";
import {ArrowLeft} from "lucide-react";

import {
    createArmy,
    getDetachments,
    getFactions
} from "../services/armyService";

import type {
    DetachmentResponse,
    FactionResponse
} from "../services/armyService";


const CreateArmyPage = () => {

    const navigate = useNavigate();


    const [name, setName] =
        useState("");

    const [factionId, setFactionId] =
        useState(0);

    const [detachmentId, setDetachmentId] =
        useState(0);

    const [pointsLimit, setPointsLimit] =
        useState(2000);


    const [factions, setFactions] =
        useState<FactionResponse[]>([]);

    const [detachments, setDetachments] =
        useState<DetachmentResponse[]>([]);


    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");


    useEffect(() => {

        const loadData = async () => {

            try {

                const [
                    factionData,
                    detachmentData
                ] = await Promise.all([
                    getFactions(),
                    getDetachments()
                ]);


                setFactions(factionData);

                setDetachments(detachmentData);

            } catch (error) {

                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Could not load army data");
                }

            } finally {
                setLoading(false);
            }
        }


        loadData();

    }, []);


    const availableDetachments =
        detachments.filter(
            (detachment) =>
                detachment.faction_id === factionId
        );


    const handleFactionChange = (
        selectedFactionId: number
    ) => {

        setFactionId(selectedFactionId);

        setDetachmentId(0);
    }


    const handleSubmit = async (
        event: SubmitEvent<HTMLFormElement>
    ) => {

        event.preventDefault();


        const trimmedName =
            name.trim();


        if (!trimmedName) {
            setError(
                "Army name is required"
            );

            return;
        }


        if (
            trimmedName.length > 30
        ) {
            setError(
                "Army name cannot be longer than 30 characters"
            );

            return;
        }


        if (
            factionId === 0 ||
            detachmentId === 0
        ) {
            setError(
                "Faction and detachment are required"
            );

            return;
        }


        setSubmitting(true);

        setError("");


        try {

            const newArmy = await createArmy(
                trimmedName,
                pointsLimit,
                factionId,
                detachmentId
            );


            navigate(
                `/armies/${newArmy.id}`
            );

        } catch (error) {

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Could not create army");
            }

        } finally {
            setSubmitting(false);
        }
    }


    return (
        <div className="mx-auto max-w-225 px-6 py-8">

            <button
                onClick={() => navigate("/")}
                className="mb-8 flex cursor-pointer items-center gap-2 text-sm text-muted hover:text-white"
            >
                <ArrowLeft size={18}/>
                Back to My Armies
            </button>


            <div className="mb-8">

                <h1 className="text-2xl font-semibold">
                    Create Army
                </h1>

                <p className="mt-1 text-sm text-muted">
                    Create a new Warhammer 40,000 army list.
                </p>

            </div>


            {error && (

                <div className="mb-6 rounded-md border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">
                    {error}
                </div>

            )}


            <form
                onSubmit={handleSubmit}
                className="rounded-lg border border-border bg-card p-6"
            >

                <div className="mb-6">

                    <label
                        htmlFor="faction"
                        className="mb-2 block text-sm font-medium"
                    >
                        Faction
                    </label>

                    <select
                        id="faction"
                        value={factionId}
                        onChange={(event) =>
                            handleFactionChange(
                                Number(event.target.value)
                            )
                        }
                        required
                        disabled={loading}
                        className="w-full rounded-md border border-border bg-background px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-gray-500"
                    >

                        <option value={0}>
                            {loading
                                ? "Loading factions..."
                                : "Select faction"
                            }
                        </option>


                        {factions.map((faction) => (

                            <option
                                key={faction.id}
                                value={faction.id}
                            >
                                {faction.name}
                            </option>

                        ))}

                    </select>

                </div>


                <div className="mb-6">

                    <label
                        htmlFor="detachment"
                        className="mb-2 block text-sm font-medium"
                    >
                        Detachment
                    </label>

                    <select
                        id="detachment"
                        value={detachmentId}
                        onChange={(event) =>
                            setDetachmentId(
                                Number(event.target.value)
                            )
                        }
                        required
                        disabled={
                            factionId === 0 ||
                            loading
                        }
                        className="w-full rounded-md border border-border bg-background px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-gray-500"
                    >

                        <option value={0}>
                            Select detachment
                        </option>


                        {availableDetachments.map(
                            (detachment) => (

                                <option
                                    key={detachment.id}
                                    value={detachment.id}
                                >
                                    {detachment.name}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <div className="mb-8">

                    <label
                        htmlFor="points"
                        className="mb-2 block text-sm font-medium"
                    >
                        Points Limit
                    </label>

                    <select
                        id="points"
                        value={pointsLimit}
                        onChange={(event) =>
                            setPointsLimit(
                                Number(event.target.value)
                            )
                        }
                        className="w-full rounded-md border border-border bg-background px-4 py-3 text-white outline-none focus:border-gray-500"
                    >

                        <option value={1000}>
                            1000 Points
                        </option>

                        <option value={1500}>
                            1500 Points
                        </option>

                        <option value={2000}>
                            2000 Points
                        </option>

                        <option value={3000}>
                            3000 Points
                        </option>

                    </select>

                </div>


                <div className="mb-8">

                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium"
                    >
                        Army Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        placeholder="My Army"
                        maxLength={30}
                        required
                        className="w-full rounded-md border border-border bg-background px-4 py-3 text-white outline-none focus:border-gray-500"
                    />

                </div>


                <div className="flex justify-end gap-3">

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="cursor-pointer rounded-md border border-border px-5 py-2.5 text-sm hover:bg-card-hover"
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            loading
                        }
                        className="cursor-pointer rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {submitting
                            ? "Creating..."
                            : "Create Army"
                        }
                    </button>

                </div>

            </form>

        </div>
    )
}


export default CreateArmyPage;
