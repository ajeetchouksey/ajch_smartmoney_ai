"""Azure Blob Storage service wrapper."""

import os
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta, timezone
import uuid


def get_blob_service_client() -> BlobServiceClient:
    return BlobServiceClient.from_connection_string(
        os.environ["AZURE_STORAGE_CONNECTION_STRING"]
    )


def _container_name() -> str:
    return os.getenv("AZURE_STORAGE_CONTAINER", "smartmoney-uploads")


def upload_file(file_bytes: bytes, filename: str, content_type: str = "application/octet-stream") -> dict:
    """Upload a file to Azure Blob Storage and return its URL."""
    client = get_blob_service_client()
    container_name = _container_name()

    # Ensure container exists
    container_client = client.get_container_client(container_name)
    try:
        container_client.create_container()
    except Exception:
        pass  # Already exists

    blob_name = f"{uuid.uuid4()}/{filename}"
    blob_client = client.get_blob_client(container=container_name, blob=blob_name)
    blob_client.upload_blob(file_bytes, content_settings=None, overwrite=True)

    url = blob_client.url
    return {"file_name": filename, "url": url, "size": len(file_bytes)}


def generate_sas_url(blob_name: str, expiry_hours: int = 1) -> str:
    """Generate a SAS URL for a blob with read access."""
    account_name = os.environ["AZURE_STORAGE_ACCOUNT_NAME"]
    account_key = os.environ["AZURE_STORAGE_ACCOUNT_KEY"]
    container_name = _container_name()

    sas_token = generate_blob_sas(
        account_name=account_name,
        container_name=container_name,
        blob_name=blob_name,
        account_key=account_key,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.now(timezone.utc) + timedelta(hours=expiry_hours),
    )
    return f"https://{account_name}.blob.core.windows.net/{container_name}/{blob_name}?{sas_token}"


def ping() -> bool:
    """Return True if Azure Storage is reachable."""
    try:
        client = get_blob_service_client()
        list(client.list_containers(max_results=1))
        return True
    except Exception:
        return False
