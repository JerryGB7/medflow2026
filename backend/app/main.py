import os

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from fastapi.middleware.cors import CORSMiddleware


from app.routers import auth
from app.config import settings
from app.routers import equipments, hospitals, work_orders


FRONTEND_ORIGIN = settings.frontend_origin
ALLOWED_ORIGINS = [
    FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app = FastAPI(
    title="Medical Equipment Tracker",
    description="Equipment Mangement API for MedFlow Project",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(hospitals.router)
app.include_router(equipments.router)
app.include_router(auth.router)
app.include_router(work_orders.router)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/version", tags=["health"])
async def version() -> dict[str, str]:
    return {"version": app.version}

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:

    return JSONResponse(
        status_code=409,
        content={"detail": "Database integrity error: likely a duplicate or constraint violation."},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error has occurred. Please try again later."}
    )