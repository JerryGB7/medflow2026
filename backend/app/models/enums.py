from enum import Enum

class EquipmentStatus(str, Enum):
    AVAILABLE = "Available"
    IN_USE = "In-Use"
    MAINTENANCE = "Maintenance"
    OFFLINE = "Offline"

class Work_Order_Priority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    CRITICAL = "Critical"

class Work_Order_Status(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In-Progress"
    COMPLETED = "Completed"
    FAILED = "Failed"

class Technician_RBAC(str, Enum):
    CLINICAL_ADMIN = "Clinical-Admin"
    FIELD_TECHNICIAN = "Field-Technician"
    AUDITOR = "Auditor"    