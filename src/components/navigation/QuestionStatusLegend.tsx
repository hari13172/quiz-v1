interface Question {
    id: number
    status: "not-visited" | "not-answered" | "answered" | "marked-review" | "answered-marked-review"
}

interface QuestionStatusLegendProps {
    questions: Question[]
}

export default function QuestionStatusLegend({ questions }: QuestionStatusLegendProps) {
    // Count questions by status
    const notAnswered = questions.filter((q) => q.status === "not-answered").length
    const answered = questions.filter((q) => q.status === "answered").length
    const markedReview = questions.filter((q) => q.status === "marked-review").length
    const answeredMarkedReview = questions.filter((q) => q.status === "answered-marked-review").length
    const notVisited = questions.filter((q) => q.status === "not-visited").length

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                        {notVisited}
                    </div>
                    <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white">
                        {notAnswered}
                    </div>
                    <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                        {answered}
                    </div>
                    <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white">
                        {markedReview}
                    </div>
                    <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white border-2 border-green-500">
                        {answeredMarkedReview}
                    </div>
                    <span>Answered & Marked for Review</span>
                    <span className="text-xs text-gray-500">(will be considered for evaluation)</span>
                </div>
            </div>
        </div>
    )
}
