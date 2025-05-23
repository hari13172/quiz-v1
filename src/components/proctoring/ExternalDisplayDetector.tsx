"use client"

import { useState, useEffect, useRef } from "react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Monitor, MonitorX, Info } from "lucide-react"

interface ExternalDisplayDetectorProps {
    active: boolean
    onContinue: () => void
}

export function ExternalDisplayDetector({ active, onContinue }: ExternalDisplayDetectorProps) {
    const [hasExternalDisplay, setHasExternalDisplay] = useState(false)
    const [showWarning, setShowWarning] = useState(false)
    const [debugInfo, setDebugInfo] = useState<string>("")
    const [showDebugInfo, setShowDebugInfo] = useState(false)
    const checkAttempts = useRef(0)

    // Function to check for external displays with simplified, reliable methods
    const checkForExternalDisplays = () => {
        checkAttempts.current += 1
        const detectionResults: Record<string, any> = {}
        let externalDisplayDetected = false

        try {
            // Get all screen metrics for debugging
            const screenWidth = window.screen.width
            const screenHeight = window.screen.height
            const availWidth = window.screen.availWidth
            const availHeight = window.screen.availHeight
            const innerWidth = window.innerWidth
            const innerHeight = window.innerHeight
            const outerWidth = window.outerWidth
            const outerHeight = window.outerHeight
            const devicePixelRatio = window.devicePixelRatio

            detectionResults.metrics = {
                screen: `${screenWidth}x${screenHeight}`,
                available: `${availWidth}x${availHeight}`,
                inner: `${innerWidth}x${innerHeight}`,
                outer: `${outerWidth}x${outerHeight}`,
                pixelRatio: devicePixelRatio,
            }

            // Method 1: Use screen.isExtended API (most reliable when available)
            if ("isExtended" in window.screen) {
                const isExtended = (window.screen as any).isExtended
                detectionResults.isExtendedAPI = isExtended

                if (isExtended) {
                    externalDisplayDetected = true
                }
            } else {
                detectionResults.isExtendedAPI = "Not available"
            }

            // Method 2: Check for significant difference between screen and available dimensions
            // This can indicate multiple monitors in some configurations
            const screenAvailWidthDiff = Math.abs(screenWidth - availWidth)
            const screenAvailHeightDiff = Math.abs(screenHeight - availHeight)

            detectionResults.screenAvailDiff = {
                width: screenAvailWidthDiff,
                height: screenAvailHeightDiff,
            }

            // If the difference is very large (more than typical taskbar/dock)
            if (screenAvailWidthDiff > 300 || screenAvailHeightDiff > 300) {
                externalDisplayDetected = true
            }

            // Method 3: Check for unusual device pixel ratio
            // Most single displays have a pixel ratio close to 1.0, 1.5, 2.0, or 3.0
            detectionResults.pixelRatioCheck = {
                value: devicePixelRatio,
                isUnusual:
                    devicePixelRatio < 0.9 ||
                    (devicePixelRatio > 1.1 && devicePixelRatio < 1.4) ||
                    (devicePixelRatio > 2.1 && devicePixelRatio < 1.9) ||
                    devicePixelRatio > 3.1,
            }

            if (detectionResults.pixelRatioCheck.isUnusual) {
                // This is a weaker signal, so only use it if another method also detected something
                if (externalDisplayDetected) {
                    externalDisplayDetected = true
                }
            }

            // Method 4: Check for unusual screen dimensions
            // Most laptops and monitors have standard aspect ratios
            const aspectRatio = screenWidth / screenHeight
            detectionResults.aspectRatio = {
                value: aspectRatio.toFixed(2),
                isUnusual: aspectRatio < 1.3 || aspectRatio > 2.1,
            }

            // Build debug info string
            setDebugInfo(JSON.stringify(detectionResults, null, 2))

            // Update state based on detection
            setHasExternalDisplay(externalDisplayDetected)

            console.log("External display detection result:", externalDisplayDetected)
            console.log("Detection details:", detectionResults)

            // Show warning if external display detected and component is active
            if (externalDisplayDetected && active) {
                setShowWarning(true)
            } else if (active) {
                // If no external display and component is active, continue
                console.log("No external display detected, continuing to coding page")
                setShowWarning(false)
                onContinue()
            }
        } catch (error) {
            console.error("Error detecting external displays:", error)
            setDebugInfo(`Error during detection: ${error}`)

            // If detection fails after multiple attempts, allow the user to continue
            if (checkAttempts.current > 2) {
                if (active) {
                    console.log("Detection failed multiple times, continuing anyway")
                    onContinue()
                }
            } else {
                // Try again after a short delay
                setTimeout(checkForExternalDisplays, 500)
            }
        }
    }

    // Check for external displays when component mounts and when active changes
    useEffect(() => {
        if (active) {
            console.log("External display detector activated")
            // Reset attempts counter
            checkAttempts.current = 0

            // Initial check with a slight delay to ensure browser is ready
            const timer = setTimeout(() => {
                checkForExternalDisplays()
            }, 500)

            return () => clearTimeout(timer)
        }
    }, [active])

    // Handle retry - check again if external displays have been disconnected
    const handleRetry = () => {
        console.log("Retrying external display detection")
        checkForExternalDisplays()
    }

    return (
        <AlertDialog open={showWarning && active} onOpenChange={setShowWarning}>
            <AlertDialogContent className="bg-[#1e1e2e] text-white border-gray-700 max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Multiple Displays Detected
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                        <div className="flex flex-col items-center my-4">
                            <MonitorX className="h-16 w-16 text-red-500 mb-4" />
                            <p className="text-center mb-2">
                                We've detected that you have multiple displays connected to your device.
                            </p>
                            <p className="text-center font-medium text-red-400">
                                External displays are not allowed during the test for security reasons.
                            </p>
                        </div>
                        <div className="bg-[#2d2d3f] border border-gray-700 rounded-md p-3 my-3">
                            <p className="font-semibold text-white mb-2">Please follow these steps:</p>
                            <ol className="list-decimal pl-5 space-y-1 text-gray-300">
                                <li>Disconnect all external monitors from your device</li>
                                <li>Close any screen sharing or remote desktop applications</li>
                                <li>If using a laptop, close the lid if you're using an external display</li>
                                <li>Click "Check Again" after you've disconnected all external displays</li>
                            </ol>
                        </div>

                        {showDebugInfo && (
                            <div className="mt-4 bg-[#1a1a2a] border border-gray-800 rounded-md p-2">
                                <p className="text-xs font-mono text-gray-400 whitespace-pre-wrap">{debugInfo}</p>
                            </div>
                        )}

                        <p className="text-center text-sm text-gray-400 mt-4">
                            You cannot proceed with the test until all external displays are disconnected.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDebugInfo(!showDebugInfo)}
                        className="text-gray-400 hover:text-white"
                    >
                        <Info className="h-4 w-4 mr-1" />
                        {showDebugInfo ? "Hide Details" : "Show Details"}
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            Check Again
                        </Button>
                        <Button variant="default" onClick={onContinue}>
                            Continue Anyway
                        </Button>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}