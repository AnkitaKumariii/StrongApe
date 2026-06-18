from typing import List, Optional

from pydantic import BaseModel


class Exercise(BaseModel):
    name: str
    sets: int
    reps: str
    rest: str


class WorkoutSegment(BaseModel):
    motto: str
    exercises: List[Exercise]
    duration: str


class DailyWorkout(BaseModel):
    day: str
    focus: str
    warm_up: WorkoutSegment
    main_routine: WorkoutSegment
    cool_down: WorkoutSegment


class WorkoutRoutinesResponse(BaseModel):
    success: bool = True
    workout_plan: List[DailyWorkout] = []
    error: Optional[str] = None
