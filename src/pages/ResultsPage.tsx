"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function ResultsPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [studentName, setStudentName] = useState("")
    const [regNumber, setRegNumber] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search)
        const name = searchParams.get("name")
        const reg = searchParams.get("regNumber")

        if (!name || !reg) {
            // If no parameters, redirect to home
            navigate("/")
            return
        }

        setStudentName(name)
        setRegNumber(reg)
        setIsLoading(false)
    }, [location.search, navigate])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="border-b bg-white">
                <div className="container mx-auto px-4 py-3">
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
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="flex justify-center mb-6">
                        <div className="text-green-500 w-24 h-24">
                            <CheckCircle className="w-full h-full" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
                    <p className="text-gray-600 mb-6">You have successfully submitted your answers.</p>

                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="mb-2">
                            <span className="font-medium">Name:</span> {studentName}
                        </div>
                        <div>
                            <span className="font-medium">Registration Number:</span> {regNumber}
                        </div>
                    </div>

                    <p className="text-gray-600 mb-8">Thank you for completing the test. Your responses have been recorded.</p>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => navigate("/")}>
                        Return to Home
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t py-4">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Succeedex Placement Portal. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
