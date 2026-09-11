from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from starlette import status

from app.database import get_db
from app.routers.auth_router import admin_dependency
from app.schemas.unit_schema import (
    UnitCreate,
    UnitResponse,
    UnitUpdate
)
from app.services.unit_service import UnitService

#GET /api/units
router = APIRouter(
    prefix="/api/units",
    tags=["Units"]
)

db_dependency = Annotated[Session, Depends(get_db)]

# GET ALL UNITS
@router.get(
    "/",
    response_model=list[UnitResponse],
    status_code=status.HTTP_200_OK
)
async def get_all_units(db: db_dependency):

    service = UnitService(db)

    return service.get_all()

# GET UNITS BY FACTION
@router.get(
    "/faction/{faction_id}",
    response_model=list[UnitResponse],
    status_code=status.HTTP_200_OK
)
async def get_units_by_faction(
    db: db_dependency,
    faction_id: int = Path(gt=0)
):

    service = UnitService(db)

    try:

        return service.get_by_faction(faction_id)

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )


@router.get(
    "/{unit_id}",
    response_model=UnitResponse,
    status_code=status.HTTP_200_OK
)
async def get_unit(
    db: db_dependency,
    unit_id: int = Path(gt=0)
):

    service = UnitService(db)

    try:

        return service.get_one(unit_id)

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        )


@router.post(
    "/",
    response_model=UnitResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_unit(
    db: db_dependency,
    unit_request: UnitCreate,
    _admin: admin_dependency
):

    service = UnitService(db)

    try:

        return service.create(
            unit_request.name,
            unit_request.type,
            unit_request.points,
            unit_request.faction_id
        )

    except ValueError as error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


@router.patch(
    "/{unit_id}",
    response_model=UnitResponse,
    status_code=status.HTTP_200_OK
)
async def update_unit(
    db: db_dependency,
    unit_request: UnitUpdate,
    _admin: admin_dependency,
    unit_id: int = Path(gt=0)
):

    service = UnitService(db)

    try:

        return service.update(
            unit_id,
            unit_request.name,
            unit_request.type,
            unit_request.points,
            unit_request.faction_id
        )

    except ValueError as error:

        if str(error) == "Unit not found":

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(error)
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


@router.delete(
    "/{unit_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_unit(
    db: db_dependency,
    _admin: admin_dependency,
    unit_id: int = Path(gt=0)
):

    service = UnitService(db)

    try:

        service.delete(unit_id)

    except ValueError as error:

        if str(error) == "Unit not found":

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(error)
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
