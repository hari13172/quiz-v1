import { Routes, Route } from "react-router-dom"


import RegistrationPage from "./pages/RegistrationPage"
import QuizPage from "./pages/QuizPage"
import ResultsPage from "./pages/ResultsPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<RegistrationPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/results" element={<ResultsPage />} />
    </Routes>
  )
}

export default App
