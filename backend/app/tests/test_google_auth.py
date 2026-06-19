import pytest
from httpx import AsyncClient
from unittest.mock import patch, MagicMock
from app.core.config import settings

@pytest.mark.asyncio
async def test_google_login_flow_new_user(client: AsyncClient):
    # Mock settings GOOGLE_CLIENT_ID
    original_client_id = settings.GOOGLE_CLIENT_ID
    settings.GOOGLE_CLIENT_ID = "mock_client_id"
    
    # Mock response from Google tokeninfo endpoint
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "aud": "mock_client_id",
        "email": "google_ape@example.com",
        "name": "Google Ape",
        "picture": "https://example.com/avatar.jpg"
    }

    with patch("httpx.AsyncClient.get", return_value=mock_response):
        payload = {"credential": "mock_credential"}
        response = await client.post("/api/auth/google", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        
    settings.GOOGLE_CLIENT_ID = original_client_id

@pytest.mark.asyncio
async def test_google_login_flow_invalid_token(client: AsyncClient):
    # Mock response from Google tokeninfo endpoint returning 400
    mock_response = MagicMock()
    mock_response.status_code = 400

    with patch("httpx.AsyncClient.get", return_value=mock_response):
        payload = {"credential": "invalid_credential"}
        response = await client.post("/api/auth/google", json=payload)
        
        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert data["error"]["message"] == "Invalid Google ID token"

@pytest.mark.asyncio
async def test_google_config_endpoint(client: AsyncClient):
    original_client_id = settings.GOOGLE_CLIENT_ID
    settings.GOOGLE_CLIENT_ID = "mock_config_client_id"
    
    response = await client.get("/api/auth/config")
    assert response.status_code == 200
    data = response.json()
    assert data["google_client_id"] == "mock_config_client_id"
    
    settings.GOOGLE_CLIENT_ID = original_client_id
