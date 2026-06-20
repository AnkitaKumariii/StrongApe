"""
In-memory presence store.

Tracks which users are currently connected to which chat threads.
Simple dict-based approach — works perfectly for a single-process server.
If you later scale to multiple processes, swap this out for Redis.
"""
from __future__ import annotations

from collections import defaultdict

# user_id -> set of thread_ids they are currently connected to
_connections: dict[int, set[int]] = defaultdict(set)


def mark_online(user_id: int, thread_id: int) -> None:
    """Register a user as online in a thread."""
    _connections[user_id].add(thread_id)


def mark_offline(user_id: int, thread_id: int) -> None:
    """Remove a user's connection for a specific thread."""
    _connections[user_id].discard(thread_id)
    if not _connections[user_id]:
        del _connections[user_id]


def is_online(user_id: int) -> bool:
    """Return True if the user has at least one active WS connection."""
    return bool(_connections.get(user_id))


def online_users() -> set[int]:
    """Return the set of all currently online user IDs."""
    return set(_connections.keys())
