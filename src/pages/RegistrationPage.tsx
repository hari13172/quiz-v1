"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalDisplayDetector } from "../components/proctoring/ExternalDisplayDetector"

export default function RegistrationPage() {
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [regNumber, setRegNumber] = useState("")
    const [isDetectorActive, setIsDetectorActive] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !regNumber.trim()) {
            alert("Please enter both name and registration number.")
            return
        }
        // Activate the external display detector instead of navigating directly
        setIsDetectorActive(true)
    }

    const handleContinue = () => {
        // Navigate to QuizPage with query parameters
        navigate(`/quiz?name=${encodeURIComponent(name)}&regNumber=${encodeURIComponent(regNumber)}`)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            {!isDetectorActive ? (
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <div className="flex items-center gap-2 mb-6">
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
                        <h1 className="text-2xl font-semibold">Succeedex Placement Portal</h1>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <Label htmlFor="regNumber">Registration Number</Label>
                            <Input
                                id="regNumber"
                                type="text"
                                value={regNumber}
                                onChange={(e) => setRegNumber(e.target.value)}
                                placeholder="Enter your registration number"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                            Start
                        </Button>
                    </form>
                </div>
            ) : (
                <ExternalDisplayDetector active={isDetectorActive} onContinue={handleContinue} />
            )}
        </div>
    )
}