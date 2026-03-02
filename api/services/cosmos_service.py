"""Azure Cosmos DB (SQL API) service wrapper."""

import os
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from typing import Optional, List
import uuid
from datetime import datetime


def get_client() -> CosmosClient:
    return CosmosClient(
        url=os.environ["COSMOS_ENDPOINT"],
        credential=os.environ["COSMOS_KEY"],
    )


def get_container(database_name: str = None, container_name: str = None):
    db_name = database_name or os.getenv("COSMOS_DATABASE", "smartmoney")
    cont_name = container_name or os.getenv("COSMOS_CONTAINER", "conversations")
    client = get_client()
    return client.get_database_client(db_name).get_container_client(cont_name)


def save_conversation(user_id: str, messages: list) -> dict:
    """Upsert a conversation document."""
    container = get_container()
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "messages": messages,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    container.upsert_item(doc)
    return doc


def get_conversations(user_id: str) -> List[dict]:
    """Retrieve all conversations for a user."""
    container = get_container()
    query = "SELECT * FROM c WHERE c.user_id = @user_id ORDER BY c.updated_at DESC"
    items = list(
        container.query_items(
            query=query,
            parameters=[{"name": "@user_id", "value": user_id}],
            enable_cross_partition_query=True,
        )
    )
    return items


def ping() -> bool:
    """Return True if Cosmos DB is reachable."""
    try:
        client = get_client()
        db_name = os.getenv("COSMOS_DATABASE", "smartmoney")
        client.get_database_client(db_name).read()
        return True
    except Exception:
        return False
