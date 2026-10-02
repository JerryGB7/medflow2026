from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import aliased

from app.schemas.equipment import EquipmentRead, EquipmentCreate, DiscrepancyRead
from app.dependencies import get_db, get_current_user, require_role
from app.models import Equipment, User, Technician_RBAC, Technician, Hospital
from app.models.enums import EquipmentStatus

router = APIRouter(prefix="/equipments", tags=["equipments"])


@router.get("", response_model = list[EquipmentRead])
async def list_equipments(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    statement = select(Equipment).where(Equipment.status != EquipmentStatus.OFFLINE)


    result = await db.execute(statement)
    return list(result.scalars().all())


@router.get("/low_battery", response_model = list[EquipmentRead])
async def active_equipments_with_low_battery(low_battery_threshold: int = 20, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):

    statement = select(Equipment).where(Equipment.battery_level < low_battery_threshold).where(Equipment.status != EquipmentStatus.OFFLINE)

    result = await db.execute(statement)
    return list(result.scalars().all())


@router.get("/equipment_id", response_model=EquipmentRead)
async def get_equipment(equipment_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)) -> Equipment:
    equipment = await db.get(Equipment, equipment_id)

    if equipment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ATM with {equipment_id} not found"
        )
    return equipment

@router.get("/discrepency", response_model=list[DiscrepancyRead])
async def discrepency(db: AsyncSession = Depends(get_db)):
    equipment_hospital = aliased(Hospital)
    technician_hospital = aliased(Hospital)
    statement = (
        select(
            Equipment.id.label("equipment_id"),
            Equipment.serial_number,
            Equipment.model,
            Equipment.status.label("equipment_status"),
            Equipment.battery_level,
            Equipment.hospital_id.label("equipment_hospital_id"),
            equipment_hospital.name.label("equipment_hospital_name"),
            Equipment.technician_id.label("equipment_technician_id"),
            Technician.id.label("technician_id"),
            Technician.name.label("technician_name"),
            Technician.hospital_id.label("technician_hospital_id"),
            technician_hospital.name.label("technician_hospital_name"),
        )
        .select_from(Equipment)
        .join(Technician, Technician.id == Equipment.technician_id)
        .join(equipment_hospital, equipment_hospital.id == Equipment.hospital_id)
        .join(technician_hospital, technician_hospital.id == Technician.hospital_id)
        .where(Technician.hospital_id != Equipment.hospital_id)
    )

    result = await db.execute(statement)
    return [dict(row) for row in result.mappings().all()]


@router.post("", response_model=EquipmentRead, status_code=status.HTTP_201_CREATED)
async def create_equipment(payload: EquipmentCreate, db: AsyncSession = Depends(get_db), 
                     _: User=Depends(require_role(Technician_RBAC.CLINICAL_ADMIN))):
   equipment = Equipment(**payload.model_dump())

   db.add(equipment)
   await db.commit()
   await db.refresh(equipment)
   return equipment

@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(equipment_id: int, db: AsyncSession = Depends(get_db),
                     _: User = Depends(require_role(Technician_RBAC.CLINICAL_ADMIN, Technician_RBAC.OPERATION_MANAGER))):
    equipment = await db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment with {equipment_id} not found"
        )

    await db.delete(equipment)
    await db.commit()