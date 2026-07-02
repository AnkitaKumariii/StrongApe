import httpx
import asyncio

async def test_backend():
    base_url = "http://127.0.0.1:8000"
    async with httpx.AsyncClient() as client:
        # Register/Login
        res = await client.post(f"{base_url}/api/auth/login", json={"username_or_email": "test@test.com", "password": "testpassword"})
        token = res.json().get("access_token")
        if not token:
            print("Login failed", res.json())
            return
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test checkin
        checkin_payload = {"duration_minutes": 45, "intensity": "High", "notes": "Crushed it!"}
        res = await client.post(f"{base_url}/api/checkin", json=checkin_payload, headers=headers)
        print("checkin:", res.status_code, res.json())

        # Test Posts
        post_payload = {"content": "Post content", "post_type": "regular"}
        res = await client.post(f"{base_url}/api/posts", json=post_payload, headers=headers)
        print("posts:", res.status_code, res.json())

        # Test get posts
        res = await client.get(f"{base_url}/api/posts", headers=headers)
        print("get posts:", res.status_code, len(res.json()) if isinstance(res.json(), list) else res.json())

asyncio.run(test_backend())
