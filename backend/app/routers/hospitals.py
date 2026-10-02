from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalCreate, HospitalRead

router = APIRouter(prefix="/hospitals", tags=["hospitals"])

@router.get("", response_model=list[HospitalRead])
async def list_hospitals(db: AsyncSession = Depends(get_db)):

    statement = select(Hospital)
    result = await db.execute(statement)
    return list(result.scalars().all())


@router.get("/{hospital_id}", response_model=HospitalRead)
async def get_hospital(hospital_id: int, db: AsyncSession = Depends(get_db)):

    hospital = await db.get(Hospital, hospital_id)
    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"branch {hospital_id} not found"
        )
    return hospital


@router.post("", response_model=HospitalRead, status_code=status.HTTP_201_CREATED)
async def create_hospital(payload: HospitalCreate, db: AsyncSession = Depends(get_db)):

    hospital = Hospital(**payload.model_dump())

    db.add(hospital)
    await db.commit()
    await db.refresh(hospital)
    return hospital