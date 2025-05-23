"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegistrationPage() {
    const [name, setName] = useState("")
    const [regNumber, setRegNumber] = useState("")
    const [errors, setErrors] = useState({ name: "", regNumber: "" })
    const navigate = useNavigate()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Reset errors
        setErrors({ name: "", regNumber: "" })

        // Validate inputs
        let hasError = false
        if (!name.trim()) {
            setErrors((prev) => ({ ...prev, name: "Name is required" }))
            hasError = true
        }

        if (!regNumber.trim()) {
            setErrors((prev) => ({ ...prev, regNumber: "Registration number is required" }))
            hasError = true
        }

        if (!hasError) {
            // Navigate to quiz page with query params
            navigate(`/quiz?name=${encodeURIComponent(name)}&regNumber=${encodeURIComponent(regNumber)}`)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center mb-2">
                        <div className="text-cyan-500 w-16 h-16">
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
                    </div>
                    <h1 className="text-2xl font-bold">Succeedex Placement Portal</h1>
                    <p className="mt-2 text-gray-600">Enter your details to start the test</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="regNumber">Registration Number</Label>
                        <Input
                            id="regNumber"
                            type="text"
                            placeholder="Enter your registration number"
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            className={errors.regNumber ? "border-red-500" : ""}
                        />
                        {errors.regNumber && <p className="text-sm text-red-500">{errors.regNumber}</p>}
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        Start Test
                    </Button>
                </form>
            </div>
        </main>
    )
}
