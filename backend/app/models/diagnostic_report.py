"""
Diagnostic Log Model - Day 3 SQLALchemy ORM version
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .work_order import WorkOrder

class DiagnosticReport(Base):
    __tablename__ = "diagnostic_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    work_order_id: Mapped[int] = mapped_column(Integer, ForeignKey("work_orders.id"))
    file_url: Mapped[str] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    work_order: Mapped["WorkOrder"] = relationship(back_populates="diagnostic_reports")

    def __repr__(self) -> str:
        return (f"DiagnosticReport(id={self.id}, service_call_id={self.work_order_id}, "
                f"file_url={self.file_url!r})")