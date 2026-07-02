import asyncio
import websockets
import httpx
import json

async def test_ws():
    base_url = "http://127.0.0.1:8000"
    async with httpx.AsyncClient() as client:
        # Register/Login user 1
        res = await client.post(f"{base_url}/api/auth/login", json={"username_or_email": "test@test.com", "password": "testpassword"})
        token = res.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        # get user id
        res = await client.get(f"{base_url}/api/users/me", headers=headers)
        user_id = res.json()["id"]

        # register user 2
        await client.post(f"{base_url}/api/auth/register", json={"email": "ws@test.com", "username": "wsuser", "full_name": "WS", "password": "ws"})
        res = await client.post(f"{base_url}/api/auth/login", json={"username_or_email": "wsuser", "password": "ws"})
        token2 = res.json().get("access_token")
        headers2 = {"Authorization": f"Bearer {token2}"}
        res = await client.get(f"{base_url}/api/users/me", headers=headers2)
        user2_id = res.json()["id"]

        # Create thread
        res = await client.post(f"{base_url}/api/chats/threads?recipient_id={user2_id}", headers=headers)
        print("Create thread:", res.status_code, res.json())
        thread_id = res.json()["id"]

        # Connect ws
        ws_url = f"ws://127.0.0.1:8000/ws/chats/{thread_id}?token={token}"
        async with websockets.connect(ws_url) as ws:
            await ws.send(json.dumps({"type": "message", "content": "Hello!"}))
            response = await ws.recv()
            print("WS Received:", response)

asyncio.run(test_ws())
