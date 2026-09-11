from sqlalchemy.orm import Session

from app.models.unit import Unit
from app.repositories.faction_repository import FactionRepository
from app.repositories.unit_repository import UnitRepository


class UnitService:


    def __init__(self, db: Session):

        self.unit_repository = UnitRepository(db)
        self.faction_repository = FactionRepository(db)


    def get_all(self):

        return self.unit_repository.get_all()


    def get_one(self, unit_id: int):

        unit = self.unit_repository.get_one(unit_id)

        if unit is None:
            raise ValueError("Unit not found")

        return unit


    def get_by_faction(self, faction_id: int):

        faction = self.faction_repository.get_one(faction_id)

        if faction is None:
            raise ValueError("Faction not found")

        return self.unit_repository.get_by_faction(faction_id)

    # CREATE UNIT
    def create(
        self,
        name: str,
        unit_type: str,
        points: int,
        faction_id: int
    ):

        if name.strip() == "":
            raise ValueError("Unit name cannot be empty")

        if unit_type.strip() == "":
            raise ValueError("Unit type cannot be empty")

        if points <= 0:
            raise ValueError("Unit points must be greater than 0")

        faction = self.faction_repository.get_one(faction_id)

        if faction is None:
            raise ValueError("Faction not found")

        existing_unit = self.unit_repository.get_by_name_and_faction(
            name.strip(),
            faction_id
        )

        if existing_unit is not None:
            raise ValueError("Unit already exists")

        unit = Unit(
            name=name.strip(),
            type=unit_type.strip(),
            points=points,
            faction_id=faction_id
        )

        return self.unit_repository.insert(unit)

    # UPDATE UNIT
    def update(
        self,
        unit_id: int,
        name: str,
        unit_type: str,
        points: int,
        faction_id: int
    ):

        unit = self.unit_repository.get_one(unit_id)

        if unit is None:
            raise ValueError("Unit not found")

        if name.strip() == "":
            raise ValueError("Unit name cannot be empty")

        if unit_type.strip() == "":
            raise ValueError("Unit type cannot be empty")

        if points <= 0:
            raise ValueError("Unit points must be greater than 0")

        faction = self.faction_repository.get_one(faction_id)

        if faction is None:
            raise ValueError("Faction not found")

        existing_unit = self.unit_repository.get_by_name_and_faction(
            name.strip(),
            faction_id
        )

        # CHECK IF A UNIT WITH THE SAME NAME AND FACTION ALREADY EXISTS
        if (
            existing_unit is not None
            and existing_unit.id != unit_id
        ):
            raise ValueError("Unit already exists")

        # UPDATE UNIT FIELDS
        unit.name = name.strip()
        unit.type = unit_type.strip()
        unit.points = points
        unit.faction_id = faction_id

        return self.unit_repository.update(unit)


    def delete(self, unit_id: int):

        unit = self.unit_repository.get_one(unit_id)

        if unit is None:
            raise ValueError("Unit not found")

        if unit.army_units:
            raise ValueError(
                "Unit cannot be deleted because it is used by armies"
            )

        return self.unit_repository.delete(unit_id)
