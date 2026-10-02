from pydantic import BaseModel, Field, ConfigDict
from app.models.equipment import EquipmentStatus


class EquipmentBase(BaseModel):
    serial_number: int
    model: str = Field(min_length=1, max_length=50)
    status: EquipmentStatus = EquipmentStatus.AVAILABLE
    battery_level: int = Field(ge=0, le=100)
    hospital_id: int
    technician_id: int | None = None


class EquipmentCreate(EquipmentBase):
    """Shape of the request body for POST /atms"""


class EquipmentRead(EquipmentBase):
    """Shape of an atm in any API Response"""
    id: int
    model_config = ConfigDict(from_attributes=True)


class DiscrepancyRead(BaseModel):
    equipment_id: int
    serial_number: int
    model: str
    equipment_status: str
    battery_level: int
    equipment_hospital_id: int
    equipment_hospital_name: str
    equipment_technician_id: int
    technician_id: int
    technician_name: str
    technician_hospital_id: int
    technician_hospital_name: str
    model_config = ConfigDict(from_attributes=True)