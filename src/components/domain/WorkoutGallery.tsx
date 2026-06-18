import { useNavigate } from "react-router-dom"
import { FlipGallery } from "./FlipGallery"

const items = [
  {
    title: "Push Day",
    secondary: "Sets: 4 | Reps: 8-12 | Time: 60m",
    text: "Focuses on chest, shoulders, and triceps hypertrophy. Employs compound movements like Bench Press, Overhead Press, and Tricep Dips to maximize upper body push strength.",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Leg Day",
    secondary: "Sets: 4 | Reps: 6-10 | Time: 75m",
    text: "Targets quads, hamstrings, and glutes. Built around Barbell Squats, Romanian Deadlifts, and lunges. Designed to establish lower body power and core stability.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "Calisthenics",
    secondary: "Sets: 3 | Reps: Max | Time: 45m",
    text: "Bodyweight flow to improve balance, strength, and endurance. Emphasizes Pull-ups, Muscle-ups, Handstand holds, and absolute control over body leverage.",
    image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=500&auto=format&fit=crop&q=80",
  },
  {
    title: "HIIT Engine",
    secondary: "Sets: 5 | Reps: Time-based | Time: 30m",
    text: "High-intensity interval conditioning. Alternates explosive kettlebell swings, burpees, and sprints. Elevates anaerobic threshold and stimulates fat oxidation.",
    image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=500&auto=format&fit=crop&q=80",
  },
]

export function WorkoutGallery() {
  const navigate = useNavigate()

  return (
    <FlipGallery
      items={items}
      heading="Meet Workout Routines"
      subtitle="Hover over any routine to view its program details."
      chosenImageAlt="Selected workout routine"
      onTryOut={() => navigate("/workout-routines")}
    />
  )
}
