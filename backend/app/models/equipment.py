from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, CheckConstraint, ForeignKey
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .enums import EquipmentStatus


if TYPE_CHECKING:
    from .hospital import Hospital
    from .technician import Technician
    from .work_order import WorkOrder


class Equipment(Base):
    __tablename__ = "equipments"


    __table_args__ = (
        CheckConstraint("battery_level BETWEEN 0 AND 100", name="battery_level_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    serial_number: Mapped[int] = mapped_column(Integer)
    model: Mapped[str] = mapped_column(String(50))
    status: Mapped[EquipmentStatus] = mapped_column(
        SqlEnum(
            EquipmentStatus,
            name="equipment_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=EquipmentStatus.AVAILABLE,
    )
    battery_level: Mapped[int] = mapped_column(Integer)
    
    hospital_id: Mapped[int] = mapped_column(Integer, ForeignKey("hospitals.id"))
    technician_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("technicians.id"), nullable=True)


    hospital: Mapped["Hospital"] = relationship(back_populates="equipments")
    technician: Mapped["Technician"] = relationship(back_populates="equipments")
    work_orders: Mapped[list["WorkOrder"]] = relationship(back_populates="equipment")

    # Method to check whether the ATM is currently in maintenance.
    def needs_maintenance(self) -> bool:
        return self.status == EquipmentStatus.MAINTENANCE

    # String representation for debugging and logging.
    def __repr__(self) -> str:
        return (
            f"ATM (serial number = {self.serial_number}, cash_level: {self.battery_level}, "
            f"branch_id: {self.hospital_id}, status: {self.status.value}"
        )
    
    
