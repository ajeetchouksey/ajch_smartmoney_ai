"""Storage router – file upload / SAS URL generation."""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from models.schemas import UploadResponse
from services import storage_service

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 10 MB limit")
    try:
        result = storage_service.upload_file(
            file_bytes=data,
            filename=file.filename,
            content_type=file.content_type or "application/octet-stream",
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Storage error: {exc}") from exc
    return UploadResponse(**result)


@router.get("/sas")
def get_sas_url(
    blob_name: str = Query(..., description="Blob name to generate a SAS URL for"),
    expiry_hours: int = Query(default=1, ge=1, le=24),
):
    try:
        url = storage_service.generate_sas_url(blob_name=blob_name, expiry_hours=expiry_hours)
        return {"sas_url": url}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Storage error: {exc}") from exc
