from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .enums import Work_Order_Priority, Work_Order_Status

if TYPE_CHECKING:
    from .technician import Technician
    from .equipment import Equipment
    from .diagnostic_report import DiagnosticReport

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(50))
    priority: Mapped[Work_Order_Priority] = mapped_column(
                    SqlEnum(Work_Order_Priority, name="work_order_priority", values_callable=lambda enum_cls:[member.value for member in enum_cls]),
                    default=Work_Order_Priority.LOW)
    status: Mapped[Work_Order_Status] = mapped_column(
            SqlEnum(Work_Order_Status, name="work_order_status", values_callable=lambda enum_cls:[member.value for member in enum_cls]),
            default=Work_Order_Status.PENDING)
    equipment_id: Mapped[int] = mapped_column(Integer, ForeignKey("equipments.id"))
    technician_id: Mapped[int] = mapped_column(Integer, ForeignKey("technicians.id"))
    

    equipment: Mapped["Equipment"] = relationship(back_populates="work_orders")    
    technician: Mapped["Technician"] = relationship(back_populates="work_orders")
    diagnostic_reports: Mapped[list["DiagnosticReport"]] = relationship(back_populates="work_order")


    def __repr__(self) -> str:
        return (f"Service call attributes: {self.title}{self.equipment_id}{self.technician_id}{self.priority}{self.status}")


        