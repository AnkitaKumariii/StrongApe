from fastapi import HTTPException
import asyncio
import logging
from typing import Any

from app.services.gemini_client import generate_text
from app.schemas.workout_routines import (
    DailyWorkout,
    Exercise,
    WorkoutRoutinesResponse,
    WorkoutSegment,
)

logger = logging.getLogger(__name__)

GOAL_LABELS = {
    "muscle": "Build Muscle",
    "weight": "Lose Weight",
    "endurance": "Improve Endurance",
    "health": "General Health",
}

EATING_STYLE_LABELS = {
    "3meals": "3 Meals/Day",
    "fasting": "Intermittent Fasting",
    "snacking": "Frequent Snacking",
}

CAFFEINE_LABELS = {
    "none": "None",
    "low": "Low (1 cup/day)",
    "moderate": "Moderate (2-3 cups/day)",
    "high": "High (4+ cups/day)",
}

SUGAR_LABELS = {
    "low": "Low (mostly natural sugars)",
    "moderate": "Moderate (occasional treats)",
    "high": "High (daily sweets)",
}

GOAL_SPLITS = {
    "muscle": ["Upper Body Push", "Lower Body", "Upper Body Pull"],
    "weight": ["HIIT Cardio", "Full Body Strength", "Metabolic Conditioning"],
    "endurance": ["Cardio Endurance", "Tempo & Intervals", "Active Recovery"],
    "health": ["Full Body Strength", "Mobility & Flexibility", "Light Cardio"],
}

WORKOUT_SYSTEM_PROMPT = (
    "You are a professional fitness coach creating safe, personalized "
    "workout plans. Always follow the requested format exactly."
)


class WorkoutRoutinesService:
    async def generate_workout_plan(self, fitness_profile: dict[str, Any]) -> WorkoutRoutinesResponse:
        try:
            goal = fitness_profile.get("primaryGoal", "health")
            splits = GOAL_SPLITS.get(goal, GOAL_SPLITS["health"])
            daily_workouts: list[DailyWorkout] = []

            for day_num, focus in enumerate(splits, start=1):
                daily_workout = await self._generate_daily_workout(
                    fitness_profile, focus, day_num
                )
                daily_workouts.append(daily_workout)

            return WorkoutRoutinesResponse(success=True, workout_plan=daily_workouts)
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("Error generating workout plan: %s", exc)
            return WorkoutRoutinesResponse(success=False, error=str(exc))

    async def _generate_daily_workout(
        self, profile: dict[str, Any], focus: str, day: int
    ) -> DailyWorkout:
        prompt = self._create_workout_prompt(profile, focus, day)
        workout_content = await asyncio.to_thread(self._get_ai_response, prompt)
        workout_data = self._parse_workout_response(workout_content)

        return DailyWorkout(
            day=f"Day {day}",
            focus=focus,
            warm_up=WorkoutSegment(
                motto="Ease in — prepare your body for the work ahead.",
                exercises=workout_data["warm_up"],
                duration="10-15 minutes",
            ),
            main_routine=WorkoutSegment(
                motto="Stay focused — every rep builds your goal.",
                exercises=workout_data["main_routine"],
                duration="30-45 minutes",
            ),
            cool_down=WorkoutSegment(
                motto="Recover well — your body grows during rest.",
                exercises=workout_data["cool_down"],
                duration="10-15 minutes",
            ),
        )

    def _get_ai_response(self, prompt: str) -> str:
        return generate_text(prompt, system_instruction=WORKOUT_SYSTEM_PROMPT)

    def _create_workout_prompt(self, profile: dict[str, Any], focus: str, day: int) -> str:
        goal_key = profile.get("primaryGoal", "health")
        goal_label = GOAL_LABELS.get(goal_key, goal_key)
        eating_style = EATING_STYLE_LABELS.get(
            profile.get("eatingStyle", ""), profile.get("eatingStyle", "Not specified")
        )
        caffeine = CAFFEINE_LABELS.get(
            profile.get("caffeine", ""), profile.get("caffeine", "Not specified")
        )
        sugar = SUGAR_LABELS.get(
            profile.get("sugar", ""), profile.get("sugar", "Not specified")
        )
        allergies = profile.get("allergies") or []
        allergies_text = ", ".join(allergies) if allergies else "None"

        diet_notes = []
        if not profile.get("dietMeat", True):
            diet_notes.append("Does not eat meat")
        if profile.get("dietLactose"):
            diet_notes.append("Lactose intolerant")
        diet_notes_text = "; ".join(diet_notes) if diet_notes else "No special dietary restrictions"

        return f"""Create a {focus} workout for Day {day} based on this user's fitness profile:

User Profile:
- Primary Goal: {goal_label}
- Weight: {profile.get("weight", "unknown")} kg
- Height: {profile.get("height", "unknown")} cm
- Eating Style: {eating_style}
- Dietary Notes: {diet_notes_text}
- Allergies: {allergies_text}
- Caffeine Consumption: {caffeine}
- Sugar Consumption: {sugar}

Tailor exercise intensity, volume, and rest periods to match the user's goal, body metrics, and energy habits.
Do NOT include any exercise descriptions, instructions, or guidelines. Provide ONLY the names and metadata.

Provide the workout plan in this exact format:

Warm-up:
- [Exercise Name]
- [Exercise Name]

Main Routine:
- [Exercise Name] | Sets: [X] | Reps: [X] | Rest: [Xs]
- [Exercise Name] | Sets: [X] | Reps: [X] | Rest: [Xs]

Cool-down:
- [Exercise Name]
- [Exercise Name]
"""

    def _parse_workout_response(self, content: str) -> dict[str, list[Exercise]]:
        segments: dict[str, list[Exercise]] = {
            "warm_up": [],
            "main_routine": [],
            "cool_down": [],
        }
        current_section = None

        lines = [line.strip() for line in content.split("\n") if line.strip()]

        for line in lines:
            lower_line = line.lower()

            if "warm-up:" in lower_line or "warmup:" in lower_line:
                current_section = "warm_up"
                continue
            if "main routine:" in lower_line or "main workout:" in lower_line:
                current_section = "main_routine"
                continue
            if "cool-down:" in lower_line or "cooldown:" in lower_line:
                current_section = "cool_down"
                continue

            if not line.lstrip().startswith(("-", "•", "*")):
                continue

            if not current_section:
                continue

            try:
                parts = [p.strip() for p in line.lstrip("- •*").split("|")]
                name = parts[0].strip() if parts else "Unnamed Exercise"

                if current_section == "main_routine":
                    exercise_data = {
                        "sets": "3",
                        "reps": "10-12",
                        "rest": "60s",
                    }
                    for part in parts[1:]:
                        part_lower = part.lower().strip()
                        if "sets:" in part_lower:
                            sets_str = "".join(filter(str.isdigit, part))
                            exercise_data["sets"] = sets_str if sets_str else "3"
                        elif "reps:" in part_lower:
                            exercise_data["reps"] = part.split(":")[-1].strip()
                        elif "rest:" in part_lower:
                            exercise_data["rest"] = part.split(":")[-1].strip()

                    segments[current_section].append(
                        Exercise(
                            name=name,
                            sets=int(exercise_data["sets"]),
                            reps=exercise_data["reps"],
                            rest=exercise_data["rest"],
                        )
                    )
                else:
                    segments[current_section].append(
                        Exercise(
                            name=name,
                            sets=1,
                            reps="As needed",
                            rest="None",
                        )
                    )
            except Exception as exc:
                logger.warning("Error parsing exercise line '%s': %s", line, exc)
                continue

        for section in segments:
            if not segments[section]:
                segments[section].append(
                    Exercise(
                        name=f"Basic {section.replace('_', ' ').title()}",
                        sets=1,
                        reps="As needed",
                        rest="None",
                    )
                )

        return segments
