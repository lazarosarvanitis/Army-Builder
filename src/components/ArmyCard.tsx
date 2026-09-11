import {useNavigate} from "react-router";

type ArmyCardProps = {
    id: number;
    name: string;
    faction: string;
    detachment: string;
    points: number;
    pointsLimit: number;
}


const getFactionCardStyle = (
    faction: string
) => {

    if (faction === "Adeptus Custodes") {
        return "border-[#9b7828]/60 bg-[#30250d] hover:bg-[#3a2d10]";
    }

    if (faction === "Eldar") {
        return "border-violet-700/40 bg-[#211a2b] hover:bg-[#2a2037]";
    }

    if (faction === "Grey Knights") {
        return "border-sky-700/50 bg-sky-950/40 hover:bg-sky-950/60";
    }

    return "border-border bg-card hover:bg-card-hover";
}


const ArmyCard = ({
                      id,
                      name,
                      faction,
                      detachment,
                      points,
                      pointsLimit
                  }: ArmyCardProps) => {

    const navigate = useNavigate();

    const factionStyle =
        getFactionCardStyle(
            faction
        );

    return (
        <div
            onClick={() => navigate(`/armies/${id}`)}
            title={name}
            className={`
                flex h-36 w-48 cursor-pointer
                flex-col justify-between overflow-hidden rounded-md
                border p-4 transition
                ${factionStyle}
            `}
        >

            <div className="min-w-0">

                <p className="truncate text-xs uppercase tracking-wider text-muted">
                    {faction}
                </p>

                <h2 className="mt-1 wrap-break-word text-sm font-semibold leading-tight">
                    {name}
                </h2>

            </div>


            <div className="min-w-0">

                <p className="truncate text-xs text-gray-400">
                    {detachment}
                </p>

                <p className="mt-1 text-xs font-semibold">
                    {points} / {pointsLimit} pts
                </p>

            </div>

        </div>
    )
}


export default ArmyCard;
