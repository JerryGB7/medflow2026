from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import case, func, select

from app.schemas.work_order import ReliabilityMetric, WorkOrderCreate, WorkOrderRead
from app.dependencies import get_db, get_current_user, require_role
from app.models import Equipment, Hospital, WorkOrder, Technician, User, Technician_RBAC
from app.models.enums import Work_Order_Priority, Work_Order_Status

router = APIRouter(prefix="/work_orders", tags=["work_orders"])



@router.get("", response_model = list[WorkOrderRead])
async def list_work_orders(db: AsyncSession = Depends(get_db)):
    
    statement = select(WorkOrder)
    result = await db.execute(statement)
    return list(result.scalars().all())



@router.get("/work_order_id", response_model=WorkOrderRead)
async def get_work_order(work_order_id: int, db: AsyncSession = Depends(get_db)) -> WorkOrder:
    work_order = await db.get(WorkOrder, work_order_id)

    if work_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"ATM with {work_order_id} not found"
        )
    return work_order

@router.get("/complete_failed_ratio", response_model=str)
async def complete_failed_service(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_user)):
    total_statement = select(func.count()).select_from(WorkOrder)
    failed_statement = select(func.count()).select_from(WorkOrder).where(
        WorkOrder.status == Work_Order_Status.FAILED
    )


    total_count = await db.scalar(total_statement)
    failed_count = await db.scalar(failed_statement)

    return (f"{failed_count / total_count * 100 if total_count else 0.0}%")


@router.get("/reliability_metrics", response_model=list[ReliabilityMetric])
async def get_reliability_metrics(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[ReliabilityMetric]:

    completed_count = func.count(case((WorkOrder.status == Work_Order_Status.COMPLETED, 1)))
    failed_count = func.count(case((WorkOrder.status == Work_Order_Status.FAILED, 1)))

    statement = (
        select(
            Equipment.model.label("model"),
            completed_count.label("completed_count"),
            failed_count.label("failed_count"),
        )
        .join(WorkOrder, WorkOrder.equipment_id == Equipment.id)
        .where(WorkOrder.status.in_((Work_Order_Status.COMPLETED, Work_Order_Status.FAILED)))
        .group_by(Equipment.model)
        .order_by(Equipment.model)
    )

    rows = (await db.execute(statement)).mappings().all()
    return [
        ReliabilityMetric(
            model=row["model"],
            completed_count=row["completed_count"],
            failed_count=row["failed_count"],
            total_resolved=row["completed_count"] + row["failed_count"],
            completion_ratio=(row["completed_count"] / (row["completed_count"] + row["failed_count"])) * 100,
            failure_ratio=(row["failed_count"] / (row["completed_count"] + row["failed_count"])) * 100,
        )
        for row in rows
    ]


@router.get("/reporting_lines", response_model=dict[str, int])
async def get_reporting_lines(
    supervisor_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict[str, int]:
    """Count technicians under a supervisor with at least one active call."""
    active_statuses = (
        Work_Order_Status.PENDING,
        Work_Order_Status.IN_PROGRESS,
    )
    statement = (
        select(func.count(func.distinct(Technician.id)))
        .select_from(Technician)
        .join(Hospital, Technician.hospital_id == Hospital.id)
        .join(WorkOrder, WorkOrder.technician_id == Technician.id)
        .where(
            Hospital.supervisor_id == supervisor_id,
            WorkOrder.status.in_(active_statuses),
        )
    )

    technician_count = await db.scalar(statement) or 0
    return {
        "supervisor_id": supervisor_id,
        "technicians_with_active_calls": technician_count,
    }



@router.post("", response_model=WorkOrderRead, status_code=status.HTTP_201_CREATED)
async def create_work_order(payload: WorkOrderCreate, db: AsyncSession = Depends(get_db), 
                     _: User=Depends(require_role(Technician_RBAC.CLINICAL_ADMIN))):
   workorder = WorkOrder(**payload.model_dump())

   db.add(workorder)
   await db.commit()
   await db.refresh(workorder)
   return workorder

#-----------------------------------------------------------------------------------

# THIS SECTION IS FOR POST FUNCTIONS
@router.patch("/{work_order_id}/status", response_model=WorkOrderRead, status_code=status.HTTP_202_ACCEPTED)
async def update_status(
    work_order_id: int,
    new_status: Work_Order_Status = Query(...),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(Technician_RBAC.FIELD_TECHNICIAN, Technician_RBAC.CLINICAL_ADMIN)),
) -> WorkOrder:
    if new_status not in (Work_Order_Status.COMPLETED, Work_Order_Status.FAILED, Work_Order_Status.IN_PROGRESS):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be in progress, complete or failed",
        )

    work_order = await db.get(WorkOrder, work_order_id)
    if work_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work Order with {work_order_id} not found",
        )

    work_order.status = new_status
    await db.commit()
    await db.refresh(work_order)
    return work_order


@router.patch("/{work_order_id}/priority", response_model=WorkOrderRead, status_code=status.HTTP_202_ACCEPTED)
async def update_priority(
    work_order_id: int,
    new_priority: Work_Order_Priority = Query(...),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(Technician_RBAC.CLINICAL_ADMIN)),
) -> WorkOrder:
    work_order = await db.get(WorkOrder, work_order_id)
    if work_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service call with {work_order_id} not found",
        )

    work_order.priority = new_priority
    await db.commit()
    await db.refresh(work_order)
    return work_order


