"""
Tests for SmartMoney AI FastAPI endpoints.
Uses httpx + pytest with mocked Azure services so no real cloud credentials are required.
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import sys
import os

# Allow the api package to be imported from the tests directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app

client = TestClient(app)


# ── Health endpoint ───────────────────────────────────────────────────────────

class TestHealth:
    def test_health_cosmos_and_storage_down(self):
        """Health endpoint returns 200 even when services are unavailable."""
        with (
            patch("services.cosmos_service.ping", return_value=False),
            patch("services.storage_service.ping", return_value=False),
        ):
            resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["cosmos_db"] == "unavailable"
        assert data["azure_storage"] == "unavailable"

    def test_health_all_services_up(self):
        with (
            patch("services.cosmos_service.ping", return_value=True),
            patch("services.storage_service.ping", return_value=True),
        ):
            resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["cosmos_db"] == "ok"
        assert data["azure_storage"] == "ok"


# ── Chat endpoint ─────────────────────────────────────────────────────────────

class TestChat:
    def _mock_openai_result(self):
        return {
            "message": {"role": "assistant", "content": "Save 20% of your income."},
            "usage": {"prompt_tokens": 10, "completion_tokens": 8, "total_tokens": 18},
        }

    def test_chat_success(self):
        with (
            patch("services.openai_service.chat_completion", return_value=self._mock_openai_result()),
            patch("services.cosmos_service.save_conversation", return_value={}),
        ):
            resp = client.post(
                "/api/chat",
                json={"messages": [{"role": "user", "content": "How do I save money?"}]},
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["message"]["role"] == "assistant"
        assert "Save" in data["message"]["content"]
        assert "total_tokens" in data["usage"]

    def test_chat_openai_failure_returns_502(self):
        with patch("services.openai_service.chat_completion", side_effect=Exception("OpenAI down")):
            resp = client.post(
                "/api/chat",
                json={"messages": [{"role": "user", "content": "test"}]},
            )
        assert resp.status_code == 502

    def test_chat_invalid_role_returns_422(self):
        resp = client.post(
            "/api/chat",
            json={"messages": [{"role": "badRole", "content": "test"}]},
        )
        assert resp.status_code == 422

    def test_chat_max_tokens_bounds(self):
        """max_tokens must be between 1 and 2048."""
        with patch("services.openai_service.chat_completion", return_value=self._mock_openai_result()):
            # Valid boundary
            resp = client.post(
                "/api/chat",
                json={"messages": [{"role": "user", "content": "hi"}], "max_tokens": 2048},
            )
            assert resp.status_code == 200

        resp = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "hi"}], "max_tokens": 9999},
        )
        assert resp.status_code == 422

    def test_chat_history_cosmos_failure_does_not_break_response(self):
        """Cosmos save failure should not fail the chat response."""
        with (
            patch("services.openai_service.chat_completion", return_value=self._mock_openai_result()),
            patch("services.cosmos_service.save_conversation", side_effect=Exception("cosmos down")),
        ):
            resp = client.post(
                "/api/chat",
                json={"messages": [{"role": "user", "content": "hello"}]},
            )
        assert resp.status_code == 200

    def test_get_history_success(self):
        mock_convs = [{"id": "1", "user_id": "u1", "messages": []}]
        with patch("services.cosmos_service.get_conversations", return_value=mock_convs):
            resp = client.get("/api/chat/history", headers={"x-user-id": "u1"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_get_history_cosmos_failure_returns_502(self):
        with patch("services.cosmos_service.get_conversations", side_effect=Exception("down")):
            resp = client.get("/api/chat/history")
        assert resp.status_code == 502


# ── Storage endpoint ──────────────────────────────────────────────────────────

class TestStorage:
    def test_upload_success(self):
        mock_result = {"file_name": "test.pdf", "url": "https://storage/test.pdf", "size": 1024}
        with patch("services.storage_service.upload_file", return_value=mock_result):
            resp = client.post(
                "/api/storage/upload",
                files={"file": ("test.pdf", b"PDF content here", "application/pdf")},
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["file_name"] == "test.pdf"
        assert data["size"] == 1024

    def test_upload_too_large_returns_413(self):
        big_data = b"x" * (10 * 1024 * 1024 + 1)  # 10 MB + 1 byte
        with patch("services.storage_service.upload_file", return_value={}):
            resp = client.post(
                "/api/storage/upload",
                files={"file": ("big.bin", big_data, "application/octet-stream")},
            )
        assert resp.status_code == 413

    def test_upload_storage_failure_returns_502(self):
        with patch("services.storage_service.upload_file", side_effect=Exception("storage down")):
            resp = client.post(
                "/api/storage/upload",
                files={"file": ("f.txt", b"hello", "text/plain")},
            )
        assert resp.status_code == 502

    def test_sas_url_success(self):
        with patch("services.storage_service.generate_sas_url", return_value="https://sas-url"):
            resp = client.get("/api/storage/sas?blob_name=myblob.pdf")
        assert resp.status_code == 200
        assert "sas_url" in resp.json()

    def test_sas_expiry_hours_out_of_range(self):
        resp = client.get("/api/storage/sas?blob_name=myblob.pdf&expiry_hours=25")
        assert resp.status_code == 422
