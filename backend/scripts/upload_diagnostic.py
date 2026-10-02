import asyncio
import boto3
from app.database import AsyncSessionLocal
from app.models import DiagnosticReport

BUCKET_NAME = "medidemo-diagnostics-jg8070"
LOCAL_FILE_PATH = "scripts/sample_diagnostic.txt"
S3_KEY = "diagnostics/medicalequip.txt"


def upload_to_s3() -> str:
    s3_client = boto3.client("s3")
    s3_client.upload_file(LOCAL_FILE_PATH, BUCKET_NAME, S3_KEY)
    return f"s3://{BUCKET_NAME}/{S3_KEY}"

async def record_diagnostic_log(file_url: str) -> None:
    async with AsyncSessionLocal() as session:
        log = DiagnosticReport(
            work_order_id=2,
            file_url=file_url,
            notes="uploaded via upload_diagnostic.py"
        )

        session.add(log)
        await session.commit()
        await session.refresh(log)
        print(f"Created DiagnosticReport id={log.id}, file_url={log.file_url}")

async def main() -> None:
    file_url = upload_to_s3()
    print(f"Uploaded to {file_url}")
    await record_diagnostic_log(file_url)

if __name__ == "__main__":
    asyncio.run(main())