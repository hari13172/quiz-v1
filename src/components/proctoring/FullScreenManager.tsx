"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface FullScreenManagerProps {
    active: boolean
    onExit: () => void
    children: React.ReactNode
}

export function FullScreenManager({ active, onExit, children }: FullScreenManagerProps) {
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [showWarning, setShowWarning] = useState(false)
    const [exitCount, setExitCount] = useState(0)
    const devToolsCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const displayCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const blockedKeyAttemptsRef = useRef(0)

    const enterFullScreen = async () => {
        try {
            const docEl = document.documentElement
            if (docEl.requestFullscreen) {
                await docEl.requestFullscreen()
            } else if ((docEl as any).mozRequestFullScreen) {
                await (docEl as any).mozRequestFullScreen()
            } else if ((docEl as any).webkitRequestFullscreen) {
                await (docEl as any).webkitRequestFullscreen()
            } else if ((docEl as any).msRequestFullscreen) {
                await (docEl as any).msRequestFullscreen()
            }
            setIsFullScreen(true)
        } catch (error) {
            console.error("Failed to enter full screen:", error)
        }
    }

    const exitFullScreen = async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen()
            } else if ((document as any).mozCancelFullScreen) {
                await (document as any).mozCancelFullScreen()
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen()
            } else if ((document as any).msExitFullscreen) {
                await (document as any).msExitFullscreen()
            }
            setIsFullScreen(false)
        } catch (error) {
            console.error("Failed to exit full screen:", error)
        }
    }

    const checkFullScreen = (): boolean => {
        return !!(
            document.fullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).msFullscreenElement
        )
    }

    const handleFullScreenChange = () => {
        const fullScreenActive = checkFullScreen()
        setIsFullScreen(fullScreenActive)
        if (active && !fullScreenActive) {
            handleFullScreenExit()
        }
    }

    const handleFullScreenExit = () => {
        const newExitCount = exitCount + 1
        setExitCount(newExitCount)
        if (newExitCount >= 3) {
            terminateTest("You exited full screen mode multiple times.")
        } else {
            setShowWarning(true)
        }
    }

    const handleContinue = async () => {
        setShowWarning(false)
        await enterFullScreen()
    }

    const terminateTest = (reason: string) => {
        setShowWarning(false)
        onExit()
    }

    const showBlockedKeyWarning = () => {
        blockedKeyAttemptsRef.current += 1
        if (blockedKeyAttemptsRef.current <= 3) {
            toast.warning("This action is not allowed during the test", {
                description: "Developer tools access is restricted in secure test mode.",
                duration: 3000,
            })
        } else if (blockedKeyAttemptsRef.current <= 5) {
            toast.error("Multiple attempts to access developer tools detected", {
                description: "Further attempts may result in test termination.",
                duration: 4000,
            })
        } else {
            toast.error("Final warning: Developer tools access is prohibited", {
                description: "Your test will be terminated if developer tools are opened.",
                duration: 5000,
            })
        }
    }

    const detectDevTools = () => {
        const threshold = 160
        const widthThreshold = window.outerWidth - window.innerWidth > threshold
        const heightThreshold = window.outerHeight - window.innerHeight > threshold
        let isDevToolsOpen = false
        const element = document.createElement("div")
        Object.defineProperty(element, "id", {
            get: () => {
                isDevToolsOpen = true
                return "id"
            },
        })
        console.log(element)
        console.clear()
        if (widthThreshold || heightThreshold || isDevToolsOpen) {
            terminateTest("Developer tools were opened during the test.")
            setInterval(() => {
                debugger
            }, 50)
        }
    }

    const checkForExternalDisplays = () => {
        try {
            let externalDisplayDetected = false
            if ("isExtended" in window.screen) {
                externalDisplayDetected = (window.screen as any).isExtended
            } else if (window.matchMedia) {
                const multipleScreens = window.matchMedia("(min-device-pixel-ratio: 0.98), (max-device-pixel-ratio: 1.02)")
                if (multipleScreens && multipleScreens.matches) {
                    const screenWidth = window.screen.width
                    const screenHeight = window.screen.height
                    const availWidth = window.screen.availWidth
                    const availHeight = window.screen.availHeight
                    const widthDiff = Math.abs(screenWidth - availWidth)
                    const heightDiff = Math.abs(screenHeight - availHeight)
                    if (widthDiff > 300 || heightDiff > 300) {
                        externalDisplayDetected = true
                    }
                }
            }
            if (!externalDisplayDetected) {
                const windowWidth = window.innerWidth
                const screenWidth = window.screen.width
                if (screenWidth > windowWidth * 2) {
                    externalDisplayDetected = true
                }
            }
            if (externalDisplayDetected && active) {
                terminateTest("External display detected during the test.")
            }
        } catch (error) {
            console.error("Error checking for external displays:", error)
        }
    }

    useEffect(() => {
        if (active && !isFullScreen) {
            enterFullScreen()
        } else if (!active && isFullScreen) {
            exitFullScreen()
        }
        document.addEventListener("fullscreenchange", handleFullScreenChange)
        document.addEventListener("mozfullscreenchange", handleFullScreenChange)
        document.addEventListener("webkitfullscreenchange", handleFullScreenChange)
        document.addEventListener("MSFullscreenChange", handleFullScreenChange)
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange)
            document.removeEventListener("mozfullscreenchange", handleFullScreenChange)
            document.removeEventListener("webkitfullscreenchange", handleFullScreenChange)
            document.removeEventListener("MSFullscreenChange", handleFullScreenChange)
        }
    }, [active, isFullScreen])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!active) return
            if ((e.altKey && (e.key === "Tab" || e.key === "F4")) || (e.ctrlKey && (e.key === "w" || e.key === "W"))) {
                e.preventDefault()
                terminateTest("You attempted to use keyboard shortcuts to switch tabs or close the window.")
            }
            if (e.key === "Escape") {
                e.preventDefault()
                showBlockedKeyWarning()
                return
            }
            if (e.key === "F12") {
                e.preventDefault()
                showBlockedKeyWarning()
                return
            }
            if (e.ctrlKey && e.shiftKey && (e.key === "i" || e.key === "I")) {
                e.preventDefault()
                showBlockedKeyWarning()
                return
            }
            if (e.ctrlKey && e.shiftKey && (e.key === "j" || e.key === "J")) {
                e.preventDefault()
                showBlockedKeyWarning()
                return
            }
            if (e.ctrlKey && e.shiftKey && (e.key === "c" || e.key === "C")) {
                e.preventDefault()
                showBlockedKeyWarning()
                return
            }
        }
        window.addEventListener("keydown", handleKeyDown, { capture: true })
        return () => window.removeEventListener("keydown", handleKeyDown, { capture: true })
    }, [active])

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (active && document.visibilityState === "hidden") {
                terminateTest("You switched to another tab or minimized the window.")
            }
        }
        document.addEventListener("visibilitychange", handleFullScreenChange)
        return () => document.removeEventListener("visibilitychange", handleFullScreenChange)
    }, [active])

    useEffect(() => {
        const handleWindowBlur = () => {
            if (active) {
                terminateTest("You switched focus away from the test window.")
            }
        }
        window.addEventListener("blur", handleWindowBlur)
        return () => window.removeEventListener("blur", handleWindowBlur)
    }, [active])

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            if (active) {
                e.preventDefault()
                showBlockedKeyWarning()
                return false
            }
        }
        document.addEventListener("contextmenu", handleContextMenu)
        return () => document.removeEventListener("contextmenu", handleContextMenu)
    }, [active])

    useEffect(() => {
        if (active) {
            devToolsCheckIntervalRef.current = setInterval(detectDevTools, 1000)
            displayCheckIntervalRef.current = setInterval(checkForExternalDisplays, 5000)
            const debuggerScript = document.createElement("script")
            debuggerScript.textContent = `
                (function() {
                    function devToolsChecker() {
                        if (window.outerHeight - window.innerHeight > 100 || 
                            window.outerWidth - window.innerWidth > 100) {
                            debugger;
                            setTimeout(devToolsChecker, 50);
                        } else {
                            setTimeout(devToolsChecker, 500);
                        }
                    }
                    devToolsChecker();
                })();
            `
            document.head.appendChild(debuggerScript)
            window.addEventListener("resize", checkForExternalDisplays)
        }
        return () => {
            if (devToolsCheckIntervalRef.current) {
                clearInterval(devToolsCheckIntervalRef.current)
            }
            if (displayCheckIntervalRef.current) {
                clearInterval(displayCheckIntervalRef.current)
            }
            window.removeEventListener("resize", checkForExternalDisplays)
        }
    }, [active])

    return (
        <>
            {children}
            <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                <AlertDialogContent className="bg-[#1e1e2e] text-white border-gray-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Warning: Full Screen Mode Required
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                            <p className="mb-2">You have exited full screen mode. This is attempt {exitCount} of 3.</p>
                            <p>
                                Please return to full screen mode to continue with your test. Exiting full screen mode is not allowed
                                during the test.
                            </p>
                            <p className="mt-2 text-red-400 font-semibold">
                                Warning: Switching tabs, minimizing the window, or using developer tools will immediately terminate your
                                test.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex items-center justify-between">
                        <Button variant="destructive" onClick={() => terminateTest("You chose to end the test.")}>
                            End Test
                        </Button>
                        <Button onClick={handleContinue} className="ml-auto">
                            Return to Full Screen
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}