import httpx
import asyncio

async def test_backend():
    base_url = "http://127.0.0.1:8000"
    async with httpx.AsyncClient() as client:
        # Register/Login
        res = await client.post(f"{base_url}/api/auth/login", json={"username_or_email": "test@test.com", "password": "testpassword"})
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test users/me
        res = await client.get(f"{base_url}/api/users/me", headers=headers)
        print("users/me:", res.status_code, res.json())
        
        # Test generate workout
        res = await client.post(f"{base_url}/api/workout-routines/generate", headers=headers)
        print("workout-routines:", res.status_code, res.json())

asyncio.run(test_backend())
