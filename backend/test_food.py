import httpx
import asyncio
import os

async def test_backend():
    base_url = "http://127.0.0.1:8000"
    async with httpx.AsyncClient() as client:
        # Register/Login
        res = await client.post(f"{base_url}/api/auth/login", json={"username_or_email": "test@test.com", "password": "testpassword"})
        token = res.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test food scanner
        # create a dummy image
        with open("dummy.jpg", "wb") as f:
            f.write(b"dummy image content")
        
        with open("dummy.jpg", "rb") as f:
            files = {"image": ("dummy.jpg", f, "image/jpeg")}
            res = await client.post(f"{base_url}/api/food-scanner", files=files, headers=headers)
            print("food-scanner:", res.status_code, res.json())

asyncio.run(test_backend())
