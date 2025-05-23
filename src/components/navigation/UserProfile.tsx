interface UserProfileProps {
    name?: string
    regNumber?: string
}

export default function UserProfile({ name = "Student", regNumber = "N/A" }: UserProfileProps) {
    return (
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <div className="font-medium">{name}</div>
                <div className="text-sm text-gray-500">Registration No. {regNumber}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center border">
                <span className="font-medium text-gray-700">{name.substring(0, 2).toUpperCase()}</span>
            </div>
        </div>
    )
}
