"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Question {
    id: number
    status: "not-visited" | "not-answered" | "answered" | "marked-review" | "answered-marked-review"
}

interface QuestionNavigationProps {
    questions: Question[]
    currentIndex: number
    onSelectQuestion: (index: number) => void
}

export default function QuestionNavigation({ questions, currentIndex, onSelectQuestion }: QuestionNavigationProps) {
    const [currentPage, setCurrentPage] = useState(0)
    const questionsPerPage = 25
    const totalPages = Math.ceil(questions.length / questionsPerPage)

    const startIndex = currentPage * questionsPerPage
    const endIndex = Math.min(startIndex + questionsPerPage, questions.length)
    const currentPageQuestions = questions.slice(startIndex, endIndex)

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1)
        }
    }

    const goToPrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-4">
                QUESTIONS {questions.length > 0 ? `${currentIndex + 1}/${questions.length}` : ""}
            </h3>
            <div className="grid grid-cols-5 gap-2">
                {currentPageQuestions.map((question, index) => {
                    const actualIndex = startIndex + index
                    return (
                        <Button
                            key={question.id}
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-10 w-10 p-0 font-normal",
                                actualIndex === currentIndex && "border-2 border-blue-500",
                                question.status === "not-visited" && "bg-gray-100",
                                question.status === "not-answered" && "bg-white border-orange-500 text-orange-500",
                                question.status === "answered" && "bg-green-100 border-green-500 text-green-700",
                                question.status === "marked-review" && "bg-purple-100 border-purple-500 text-purple-700",
                                question.status === "answered-marked-review" &&
                                "bg-purple-100 border-purple-500 text-purple-700 ring-2 ring-green-500",
                            )}
                            onClick={() => onSelectQuestion(actualIndex)}
                        >
                            {question.id}
                        </Button>
                    )
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPrevPage}
                        disabled={currentPage === 0}
                        className="flex items-center gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" /> Prev
                    </Button>
                    <span className="text-sm">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages - 1}
                        className="flex items-center gap-1"
                    >
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
