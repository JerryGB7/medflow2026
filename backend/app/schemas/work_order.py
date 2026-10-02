from pydantic import BaseModel, ConfigDict
from app.models.work_order import Work_Order_Priority, Work_Order_Status


class WorkOrderBase(BaseModel):
    title: str
    priority: Work_Order_Priority = Work_Order_Priority.LOW
    status: Work_Order_Status = Work_Order_Status.PENDING
    equipment_id: int
    technician_id: int
    

    model_config = ConfigDict(from_attributes=True)

class WorkOrderCreate(WorkOrderBase):
    """Shape of the request body for POST /atms"""


class WorkOrderRead(WorkOrderBase):
    """Shape of an atm in any API Response"""
    id: int
    model_config = ConfigDict(from_attributes=True)


class ReliabilityMetric(BaseModel):
    """Resolved service-call outcomes grouped by ATM model."""

    model: str
    completed_count: int
    failed_count: int
    total_resolved: int
    completion_ratio: float
    failure_ratio: float