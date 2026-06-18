import { useState } from "react"
import { Link } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Button } from "@/components/ui/button"
import TextType from "@/components/ui/TextType"
import { Card, CardContent } from "@/components/ui/card"
import { CanvasText } from "@/components/ui/canvas-text"
import { api } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import {
  Dumbbell,
  Loader2,
  AlertCircle,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface Exercise {
  name: string
  sets: number
  reps: string
  rest: string
  instructions: string
}

interface WorkoutSegment {
  motto: string
  exercises: Exercise[]
  duration: string
}

interface DailyWorkout {
  day: string
  focus: string
  warm_up: WorkoutSegment
  main_routine: WorkoutSegment
  cool_down: WorkoutSegment
}

interface WorkoutRoutinesResponse {
  success: boolean
  workout_plan: DailyWorkout[]
  error?: string
}

const GOAL_LABELS: Record<string, string> = {
  muscle: "Build Muscle",
  weight: "Lose Weight",
  endurance: "Improve Endurance",
  health: "General Health",
}

function ExerciseList({ exercises, showSets }: { exercises: Exercise[]; showSets?: boolean }) {
  return (
    <ul className="space-y-3">
      {exercises.map((exercise) => (
        <li
          key={`${exercise.name}-${exercise.instructions}`}
          className="bg-slate-50 border border-slate-100 rounded-xl p-4"
        >
          <p className="font-bold text-slate-900">{exercise.name}</p>
          {showSets && (
            <p className="text-xs font-semibold text-primary mt-1">
              {exercise.sets} sets × {exercise.reps} reps · Rest {exercise.rest}
            </p>
          )}
          {exercise.instructions && (
            <p className="text-sm text-slate-500 font-medium mt-2">{exercise.instructions}</p>
          )}
        </li>
      ))}
    </ul>
  )
}

function WorkoutDayCard({ workout }: { workout: DailyWorkout }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{workout.day}</h3>
            <p className="text-sm text-slate-500 font-medium">{workout.focus}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {expanded && (
        <CardContent className="px-6 pb-6 pt-0 space-y-6">
          {[
            { title: "Warm-up", segment: workout.warm_up, showSets: false },
            { title: "Main Routine", segment: workout.main_routine, showSets: true },
            { title: "Cool-down", segment: workout.cool_down, showSets: false },
          ].map(({ title, segment, showSets }) => (
            <div key={title}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h4>
                <span className="text-xs font-semibold text-slate-400">{segment.duration}</span>
              </div>
              <p className="text-sm text-primary font-medium italic mb-3">{segment.motto}</p>
              <ExerciseList exercises={segment.exercises} showSets={showSets} />
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}

export function WorkoutRoutines() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [workoutPlan, setWorkoutPlan] = useState<DailyWorkout[] | null>(null)

  const fitnessProfile = user?.settings?.fitness_profile
  const hasProfile =
    fitnessProfile?.primaryGoal &&
    fitnessProfile?.weight &&
    fitnessProfile?.height &&
    fitnessProfile?.eatingStyle &&
    fitnessProfile?.caffeine &&
    fitnessProfile?.sugar

  const handleGenerate = async () => {
    setError(null)
    setWorkoutPlan(null)
    setLoading(true)

    try {
      const result = await api.post<WorkoutRoutinesResponse>("/api/workout-routines/generate")

      if (!result.success || !result.workout_plan?.length) {
        setError(result.error || "Failed to generate workout plan.")
        return
      }

      setWorkoutPlan(result.workout_plan)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate workout plan."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="group relative text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900">
            AI{" "}
            <CanvasText
              text="Workout Routines"
              backgroundClassName="bg-slate-900"
              colors={[
                "rgba(0, 104, 249, 1)",
                "rgba(0, 104, 249, 0.9)",
                "rgba(0, 104, 249, 0.8)",
                "rgba(0, 104, 249, 0.7)",
                "rgba(0, 104, 249, 0.6)",
                "rgba(0, 104, 249, 0.5)",
                "rgba(0, 104, 249, 0.4)",
                "rgba(0, 104, 249, 0.3)",
                "rgba(0, 104, 249, 0.2)",
                "rgba(0, 104, 249, 0.1)",
              ]}
              lineGap={4}
              animationDuration={20}
            />
          </h1>
          <TextType
            as="p"
            className="text-slate-500 text-base md:text-lg font-medium leading-relaxed justify-center"
            text="Get a personalized 3-day workout plan built from your fitness profile and goals."
            typingSpeed={30}
            loop={false}
            showCursor={false}
          />
        </div>

        {!hasProfile ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Fitness Profile Required</h2>
              <p className="text-slate-500 font-medium mb-6">
                Complete your fitness profile on the dashboard so we can tailor workouts to your goals,
                body metrics, and dietary habits.
              </p>
              <Button asChild className="rounded-full font-bold shadow-lg shadow-primary/20">
                <Link to="/">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-slate-200 shadow-sm mb-6">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Your Fitness Profile</h2>
                </div>
                <p className="text-slate-500 text-sm font-medium mb-4">
                  Your workout plan will be generated using the profile you saved on the dashboard.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Goal</p>
                    <p className="font-bold text-slate-900 mt-1">
                      {GOAL_LABELS[fitnessProfile.primaryGoal] || fitnessProfile.primaryGoal}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Weight</p>
                    <p className="font-bold text-slate-900 mt-1">{fitnessProfile.weight} kg</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Height</p>
                    <p className="font-bold text-slate-900 mt-1">{fitnessProfile.height} cm</p>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full mt-6 rounded-full font-bold shadow-lg shadow-primary/20 h-12 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating your plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Workout Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-slate-500 font-medium text-sm">
                  Building your personalized 3-day routine with Gemini AI...
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            {workoutPlan && (
              <div className="space-y-4 mt-6">
                <h2 className="text-lg font-bold text-slate-900">Your 3-Day Plan</h2>
                {workoutPlan.map((day) => (
                  <WorkoutDayCard key={day.day} workout={day} />
                ))}
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="rounded-full font-bold"
                  >
                    Regenerate Plan
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
