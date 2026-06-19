import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Dashboard } from "@/pages/Dashboard"
import { Communities } from "@/pages/Communities"
import { Nearby } from "@/pages/Nearby"
import { Profile } from "@/pages/Profile"
import { Messages } from "@/pages/Messages"
import { Leaderboard } from "@/pages/Leaderboard"
import { FoodScanner } from "@/pages/FoodScanner"
import { WorkoutRoutines } from "@/pages/WorkoutRoutines"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/nearby" element={<Nearby />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/food-scanner" element={<FoodScanner />} />
        <Route path="/workout-routines" element={<WorkoutRoutines />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App


