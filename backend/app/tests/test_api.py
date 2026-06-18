import pytest
from httpx import AsyncClient

# Test Auth, Profile, & Nearby Users
@pytest.mark.asyncio
async def test_auth_and_profile_flow(client: AsyncClient):
    # 1. Register User 1
    reg_payload = {
        "email": "ape1@strong.com",
        "username": "strongape1",
        "full_name": "Ape One",
        "password": "strongpassword123"
    }
    response = await client.post("/api/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == reg_payload["email"]
    assert data["username"] == reg_payload["username"]
    assert "id" in data

    # 2. Register User 2 (for nearby tests)
    reg_payload2 = {
        "email": "ape2@strong.com",
        "username": "strongape2",
        "full_name": "Ape Two",
        "password": "strongpassword123"
    }
    response2 = await client.post("/api/auth/register", json=reg_payload2)
    assert response2.status_code == 201
    user2_id = response2.json()["id"]

    # 3. Login User 1
    login_payload = {
        "username_or_email": "strongape1",
        "password": "strongpassword123"
    }
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Login User 2
    login_payload2 = {
        "username_or_email": "strongape2",
        "password": "strongpassword123"
    }
    response = await client.post("/api/auth/login", json=login_payload2)
    token2 = response.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # 4. Get User 1 Profile (/me)
    response = await client.get("/api/users/me", headers=headers)
    assert response.status_code == 200
    profile = response.json()
    assert profile["username"] == "strongape1"

    # 5. Update Profile & Set Location (/me/profile)
    update_payload = {
        "full_name": "Ape One Updated",
        "gym_name": "Alpha Gym Koramangala",
        "location_lat": 12.9352,
        "location_lon": 77.6244,
        "settings": {"notifications": False}
    }
    response = await client.patch("/api/users/me/profile", json=update_payload, headers=headers)
    assert response.status_code == 200
    profile_updated = response.json()
    assert profile_updated["full_name"] == "Ape One Updated"
    assert profile_updated["gym_name"] == "Alpha Gym Koramangala"
    assert profile_updated["location_lat"] == 12.9352
    assert profile_updated["settings"]["notifications"] is False

    # Update User 2 Profile Location close to User 1
    update_payload2 = {
        "location_lat": 12.9380, # very close
        "location_lon": 77.6250
    }
    await client.patch("/api/users/me/profile", json=update_payload2, headers=headers2)

    # 6. Get Nearby Users (/nearby)
    response = await client.get("/api/users/nearby?max_distance_km=10", headers=headers)
    assert response.status_code == 200
    nearby_list = response.json()
    assert len(nearby_list) >= 1
    assert nearby_list[0]["id"] == user2_id
    assert "distance_km" in nearby_list[0]
    assert nearby_list[0]["distance_km"] < 1.0


# Test Log Workout (Check-in) & Feed Posts / Likes
@pytest.mark.asyncio
async def test_checkin_and_posts_flow(client: AsyncClient):
    # Login first
    login_payload = {
        "username_or_email": "strongape1",
        "password": "strongpassword123"
    }
    response = await client.post("/api/auth/login", json=login_payload)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Log workout check-in
    checkin_payload = {
        "duration_minutes": 45,
        "intensity": "High",
        "notes": "Crushed high-intensity legs day workout!"
    }
    response = await client.post("/api/checkin", json=checkin_payload, headers=headers)
    assert response.status_code == 201
    checkin_data = response.json()
    assert checkin_data["duration_minutes"] == 45
    assert checkin_data["intensity"] == "High"

    # Profile streak/level should update
    response = await client.get("/api/users/me", headers=headers)
    profile = response.json()
    assert profile["current_streak"] == 1
    assert profile["xp"] == 200

    # 2. Get Feed Posts (check-in post should be auto-created)
    response = await client.get("/api/posts", headers=headers)
    assert response.status_code == 200
    feed = response.json()
    assert len(feed) >= 1
    checkin_post = next((p for p in feed if p["post_type"] == "check_in"), None)
    assert checkin_post is not None
    assert "legs day" in checkin_post["content"]
    assert checkin_post["post_metadata"]["xp_gained"] == 200
    assert checkin_post["likes_count"] == 0
    assert checkin_post["has_liked"] is False

    post_id = checkin_post["id"]

    # 3. Create regular post
    post_payload = {
        "content": "Excited to reach a 30-day streak soon!",
        "post_type": "regular"
    }
    response = await client.post("/api/posts", json=post_payload, headers=headers)
    assert response.status_code == 200
    created_post = response.json()
    assert created_post["content"] == post_payload["content"]

    # 4. Toggle Like on post
    response = await client.post(f"/api/posts/{post_id}/like", headers=headers)
    assert response.status_code == 200
    like_data = response.json()
    assert like_data["liked"] is True
    assert like_data["likes_count"] == 1

    # Check feed again, user has_liked should be True
    response = await client.get("/api/posts", headers=headers)
    post_check = next((p for p in response.json() if p["id"] == post_id))
    assert post_check["has_liked"] is True
    assert post_check["likes_count"] == 1

    # Toggle Like again to unlike
    response = await client.post(f"/api/posts/{post_id}/like", headers=headers)
    assert response.status_code == 200
    assert response.json()["liked"] is False
    assert response.json()["likes_count"] == 0

    # 5. Try to delete the post using another user (strongape2)
    login_payload2 = {
        "username_or_email": "strongape2",
        "password": "strongpassword123"
    }
    response = await client.post("/api/auth/login", json=login_payload2)
    token2 = response.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    response = await client.delete(f"/api/posts/{post_id}", headers=headers2)
    assert response.status_code == 403

    # 6. Delete the post using the author (strongape1)
    response = await client.delete(f"/api/posts/{post_id}", headers=headers)
    assert response.status_code == 200

    # 7. Check that the post is no longer in the feed
    response = await client.get("/api/posts", headers=headers)
    feed_after_delete = response.json()
    assert not any(p["id"] == post_id for p in feed_after_delete)


# Test Communities Flow
@pytest.mark.asyncio
async def test_communities_flow(client: AsyncClient):
    login_payload = {
        "username_or_email": "strongape1",
        "password": "strongpassword123"
    }
    response = await client.post("/api/auth/login", json=login_payload)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create community
    comm_payload = {
        "name": "Koramangala Calisthenics",
        "description": "A community for street workout and calisthenics in Bangalore.",
        "cover_image_url": "http://example.com/cover.jpg",
        "category": "Strength"
    }
    response = await client.post("/api/communities", json=comm_payload, headers=headers)
    assert response.status_code == 201
    comm = response.json()
    assert comm["name"] == comm_payload["name"]
    comm_id = comm["id"]

    # 2. List all explore communities
    response = await client.get("/api/communities", headers=headers)
    assert response.status_code == 200
    comms = response.json()
    assert len(comms) >= 1
    assert comms[0]["name"] == comm_payload["name"]
    assert comms[0]["is_member"] is False

    # 3. Join community
    response = await client.post(f"/api/communities/{comm_id}/join", headers=headers)
    assert response.status_code == 200
    assert response.json()["community_id"] == comm_id

    # 4. List joined communities
    response = await client.get("/api/communities/joined", headers=headers)
    assert response.status_code == 200
    joined = response.json()
    assert len(joined) >= 1
    assert joined[0]["id"] == comm_id

    # 5. Get community detail
    response = await client.get(f"/api/communities/{comm_id}", headers=headers)
    assert response.status_code == 200
    detail = response.json()
    assert detail["is_member"] is True
    assert detail["member_count"] == 1


# Test Challenges Flow
@pytest.mark.asyncio
async def test_challenges_flow(client: AsyncClient):
    login_payload = {
        "username_or_email": "strongape1",
        "password": "strongpassword123"
    }
    response = await client.post("/api/auth/login", json=login_payload)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Challenge
    ch_payload = {
        "title": "30-Day Push Challenge",
        "description": "Do push workouts daily for 30 days.",
        "total_days": 30,
        "xp_reward": 500,
        "is_global": False
    }
    response = await client.post("/api/challenges", json=ch_payload, headers=headers)
    assert response.status_code == 201
    ch_data = response.json()
    assert ch_data["title"] == ch_payload["title"]
    ch_id = ch_data["id"]

    # 2. Browse challenges
    response = await client.get("/api/challenges/browse", headers=headers)
    assert response.status_code == 200
    browse = response.json()
    assert len(browse) >= 1
    assert browse[0]["id"] == ch_id

    # 3. Join challenge
    response = await client.post(f"/api/challenges/{ch_id}/join", headers=headers)
    assert response.status_code == 200
    joined = response.json()
    assert joined["challenge_id"] == ch_id
    assert joined["progress_days"] == 0

    # 4. Active challenges list
    response = await client.get("/api/challenges/active", headers=headers)
    assert response.status_code == 200
    active = response.json()
    assert len(active) == 1
    assert active[0]["challenge_id"] == ch_id

    # 5. Advance progress
    response = await client.post(f"/api/challenges/{ch_id}/progress?days=29", headers=headers)
    assert response.status_code == 200
    prog = response.json()
    assert prog["progress_days"] == 29
    assert prog["is_completed"] is False

    # Advance to completion (adds 1 day -> 30 days total)
    response = await client.post(f"/api/challenges/{ch_id}/progress?days=1", headers=headers)
    assert response.status_code == 200
    completed = response.json()
    assert completed["progress_days"] == 30
    assert completed["is_completed"] is True

    # Active challenges should now be empty
    response = await client.get("/api/challenges/active", headers=headers)
    assert len(response.json()) == 0

    # User XP should have received the +500 XP reward (previous XP was 200, total should now be 700)
    response = await client.get("/api/users/me", headers=headers)
    assert response.json()["xp"] == 700


# Test Chats & Messaging Flow
@pytest.mark.asyncio
async def test_chats_flow(client: AsyncClient):
    # Login User 1
    login1 = await client.post("/api/auth/login", json={"username_or_email": "strongape1", "password": "strongpassword123"})
    token1 = login1.json()["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Login User 2
    login2 = await client.post("/api/auth/login", json={"username_or_email": "strongape2", "password": "strongpassword123"})
    token2 = login2.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}
    user2_id = (await client.get("/api/users/me", headers=headers2)).json()["id"]

    # 1. Create a Chat Thread with User 2
    response = await client.post(f"/api/chats/threads?recipient_id={user2_id}", headers=headers1)
    assert response.status_code == 201
    thread = response.json()
    thread_id = thread["id"]
    assert len(thread["participants"]) >= 1

    # 2. Send message from User 1 to User 2
    msg_payload = {"content": "Hey there! Ready to hit the gym?"}
    response = await client.post(f"/api/chats/threads/{thread_id}/messages", json=msg_payload, headers=headers1)
    assert response.status_code == 201
    msg_data = response.json()
    assert msg_data["content"] == msg_payload["content"]
    assert msg_data["is_read"] is False

    # 3. Retrieve chat threads for User 2 (unread_count should be 1, last_message preview should match)
    response = await client.get("/api/chats/threads", headers=headers2)
    assert response.status_code == 200
    threads = response.json()
    assert len(threads) >= 1
    t = next((thread for thread in threads if thread["id"] == thread_id))
    assert t["unread_count"] == 1
    assert t["last_message"]["content"] == msg_payload["content"]

    # 4. Get thread messages (User 2 reads the message)
    response = await client.get(f"/api/chats/threads/{thread_id}/messages", headers=headers2)
    assert response.status_code == 200
    messages = response.json()
    assert len(messages) == 1
    assert messages[0]["content"] == msg_payload["content"]

    # Check threads again, User 2 unread_count should now be 0 since messages were read
    response = await client.get("/api/chats/threads", headers=headers2)
    t = next((thread for thread in response.json() if thread["id"] == thread_id))
    assert t["unread_count"] == 0
