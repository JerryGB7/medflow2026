from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
      from .hospital import Hospital
      from .work_order import WorkOrder
      from .equipment import Equipment

class Technician(Base):
    __tablename__ = "technicians"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(20))
    hospital_id: Mapped[int] = mapped_column(Integer, ForeignKey("hospitals.id"))

   
    hospital: Mapped["Hospital"] = relationship(back_populates="technicians")
    equipments: Mapped[list["Equipment"]] = relationship(back_populates="technician")  
    work_orders: Mapped[list["WorkOrder"]] = relationship(back_populates="technician")


    def __repr__(self) -> str:
            return (f"Technician attributes: {self.id}{self.name}")
