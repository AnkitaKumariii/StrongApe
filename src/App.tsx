import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Dashboard } from "@/pages/Dashboard"
import { Landing } from "@/pages/Landing"
import { Communities } from "@/pages/Communities"
import { Nearby } from "@/pages/Nearby"
import { Profile } from "@/pages/Profile"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<Landing />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/nearby" element={<Nearby />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  )
}

export default App
