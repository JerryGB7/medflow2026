from pydantic import BaseModel, ConfigDict, Field


class HospitalBase(BaseModel):
    # String fields with specific lengths
    name: str = Field(min_length=1, max_length=50)
    location_region: str = Field(min_length=1, max_length=100)
    capacity: int 
    supervisor_id: int

class HospitalCreate(HospitalBase):
    """
    shape of the request body for POST /robots
    """

class HospitalRead(HospitalBase):
    id: int
    model_config = ConfigDict(from_attributes=True)