"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup } from "@/components/ui/radio-group"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import QuestionNavigation from "../components/navigation/QuestionNavigation"
import QuestionStatusLegend from "../components/navigation/QuestionStatusLegend"
import UserProfile from "../components/navigation/UserProfile"
import { questions } from "../data/questions"
// Question types
type QuestionType = "multiple-choice" | "fill-in-blank" | "true-false" | "image-based"

interface Option {
    id: string
    text: string
}

interface Question {
    id: number
    type: QuestionType
    text: string
    options?: Option[]
    correctAnswer?: string
    userAnswer?: string
    status: "not-visited" | "not-answered" | "answered" | "marked-review" | "answered-marked-review"
    imageUrl?: string
}

export default function QuizPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoading, setIsLoading] = useState(true)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState(7200) // 2 hours in seconds
    const [quizQuestions, setQuizQuestions] = useState<Question[]>(questions)

    // Get query parameters
    const searchParams = new URLSearchParams(location.search)
    const studentName = searchParams.get("name") || ""
    const regNumber = searchParams.get("regNumber") || ""

    useEffect(() => {
        // Validate required parameters
        if (!studentName || !regNumber) {
            navigate("/")
            return
        }
        setIsLoading(false)
    }, [studentName, regNumber, navigate])

    // Format time as HH:MM:SS
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 0) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const currentQuestion = quizQuestions[currentQuestionIndex]

    // Handle answer change
    const handleAnswerChange = (value: string) => {
        const updatedQuestions = [...quizQuestions]
        updatedQuestions[currentQuestionIndex] = {
            ...currentQuestion,
            userAnswer: value,
            status: currentQuestion.status.includes("marked-review") ? "answered-marked-review" : "answered",
        }
        setQuizQuestions(updatedQuestions)
    }

    // Navigation functions
    const goToNextQuestion = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
    }

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const goToQuestion = (index: number) => {
        if (index >= 0 && index < quizQuestions.length) {
            setCurrentQuestionIndex(index)
        }
    }

    // Action functions
    const saveAndNext = () => {
        goToNextQuestion()
    }

    const markForReview = () => {
        const updatedQuestions = [...quizQuestions]
        updatedQuestions[currentQuestionIndex] = {
            ...currentQuestion,
            status: currentQuestion.status === "answered" ? "answered-marked-review" : "marked-review",
        }
        setQuizQuestions(updatedQuestions)
    }

    const clearResponse = () => {
        const updatedQuestions = [...quizQuestions]
        updatedQuestions[currentQuestionIndex] = {
            ...currentQuestion,
            userAnswer: undefined,
            status: currentQuestion.status.includes("marked-review") ? "marked-review" : "not-answered",
        }
        setQuizQuestions(updatedQuestions)
    }

    const handleSubmit = () => {
        // Navigate to results page with the same parameters
        navigate(`/results?name=${encodeURIComponent(studentName)}&regNumber=${encodeURIComponent(regNumber)}`)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b bg-white sticky top-0 z-10">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="text-cyan-500 w-10 h-10">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path
                                    d="M8 12L11 15L16 9"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <h1 className="text-xl font-semibold">Succeedex Placement Portal</h1>
                    </div>
                    <UserProfile name={studentName} regNumber={regNumber} />
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
                {/* Question area */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Aptitude</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">Remaining time</span>
                            <div className="bg-orange-500 text-white px-3 py-1 rounded flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span className="font-mono">{formatTime(timeRemaining)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Question display */}
                    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                        <h3 className="font-bold mb-4">QUESTION {currentQuestion.id}</h3>
                        <p className="mb-6">{currentQuestion.text}</p>

                        {/* Display image if it's an image-based question */}
                        {currentQuestion.imageUrl && (
                            <div className="mb-6">
                                <img
                                    src={currentQuestion.imageUrl || "/placeholder.svg"}
                                    alt="Question illustration"
                                    className="max-w-full h-auto border rounded-md shadow-sm"
                                />
                            </div>
                        )}

                        {(currentQuestion.type === "multiple-choice" ||
                            currentQuestion.type === "true-false" ||
                            currentQuestion.type === "image-based") &&
                            currentQuestion.options && (
                                <div className="space-y-2">
                                    {currentQuestion.options[0].text.includes("I,") && (
                                        <div className="space-y-2 mb-6">
                                            <p className="ml-4">I: Lorem ipsum dolor sit amet consectetur</p>
                                            <p className="ml-4">
                                                II: Lorem ipsum dolor sit amet consectetur. Vulputate tincidunt at sollicitudin et ultrices eget
                                                volutpat gravida.
                                            </p>
                                            <p className="ml-4">III: Lorem ipsum dolor sit amet consectetur</p>
                                            <p className="ml-4">IV: Lorem ipsum dolor sit amet consectetur</p>
                                            <p className="ml-4">V: Lorem ipsum dolor sit amet consectetur</p>
                                        </div>
                                    )}
                                    <RadioGroup
                                        value={currentQuestion.userAnswer || ""}
                                        onValueChange={handleAnswerChange}
                                        className="space-y-3"
                                    >
                                        {currentQuestion.options.map((option) => (
                                            <div
                                                key={option.id}
                                                className="flex items-center space-x-2 border rounded-md p-4 hover:bg-gray-50"
                                            >
                                                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                                                <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                                                    <span className="font-medium mr-2">{option.id}</span>
                                                    {option.text}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            )}

                        {currentQuestion.type === "fill-in-blank" && (
                            <div className="mt-6">
                                <Input
                                    type="text"
                                    placeholder="Type your answer here"
                                    value={currentQuestion.userAnswer || ""}
                                    onChange={(e) => handleAnswerChange(e.target.value)}
                                    className="w-full p-3 border rounded-md"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap justify-between items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={goToPreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="flex items-center gap-1"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </Button>

                        <div className="flex flex-wrap gap-2">
                            <Button onClick={saveAndNext} className="bg-green-500 hover:bg-green-600">
                                SAVE & NEXT
                            </Button>
                            <Button variant="outline" onClick={clearResponse}>
                                CLEAR
                            </Button>
                            <Button onClick={markForReview} className="bg-orange-500 hover:bg-orange-600">
                                SAVE & MARK FOR REVIEW
                            </Button>
                            <Button
                                onClick={() => {
                                    markForReview()
                                    goToNextQuestion()
                                }}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                MARK FOR REVIEW & NEXT
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            onClick={goToNextQuestion}
                            disabled={currentQuestionIndex === quizQuestions.length - 1}
                            className="flex items-center gap-1"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-80 space-y-6 md:sticky md:top-20 md:h-fit">
                    <QuestionStatusLegend questions={quizQuestions} />
                    <QuestionNavigation
                        questions={quizQuestions}
                        currentIndex={currentQuestionIndex}
                        onSelectQuestion={goToQuestion}
                    />
                    <Button onClick={handleSubmit} className="w-full bg-blue-500 hover:bg-blue-600 py-6">
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    )
}
