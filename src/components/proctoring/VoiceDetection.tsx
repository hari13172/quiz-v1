
"use client"

import React, { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"

interface VoiceDetectionProps {
    active: boolean
    stream: MediaStream | null
    onNoiseDetected: (reason: string) => void
}

const VoiceDetection: React.FC<VoiceDetectionProps> = ({ active, stream, onNoiseDetected }) => {
    const [isAudioProcessing, setIsAudioProcessing] = useState<boolean>(false)
    const [noiseCount, setNoiseCount] = useState<number>(0)
    const [popupCount, setPopupCount] = useState<number>(0)
    const [lastNoiseWarning, setLastNoiseWarning] = useState<number>(0)
    const [isNoisePopupOpen, setIsNoisePopupOpen] = useState<boolean>(false)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const NOISE_THRESHOLD = 0.05 // Adjusted for typical speech levels
    const WARNING_INTERVAL = 2000 // 2 seconds between toasts
    const NOISE_VIOLATION_LIMIT = 5 // Number of noise detections to trigger a popup
    const NOISE_POPUP_LIMIT = 3 // Three chances before termination

    useEffect(() => {
        if (!active || !stream) {
            console.log("[VoiceDetection] Inactive or no stream, stopping audio processing...")
            stopAudioProcessing()
            return
        }

        const setupAudio = async () => {
            try {
                console.log("[VoiceDetection] Setting up audio processing...")
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
                analyserRef.current = audioContextRef.current.createAnalyser()
                analyserRef.current.fftSize = 2048

                sourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
                sourceRef.current.connect(analyserRef.current)

                setIsAudioProcessing(true)
                console.log("[VoiceDetection] Audio processing started.")
            } catch (err: unknown) {
                console.error("[VoiceDetection] Audio setup failed:", (err as Error).message)
                toast.error("Audio Proctoring Failed", {
                    description: "Unable to access microphone for proctoring.",
                })
            }
        }

        setupAudio()

        return () => {
            console.log("[VoiceDetection] Cleaning up audio processing...")
            stopAudioProcessing()
        }
    }, [active, stream])

    const stopAudioProcessing = () => {
        if (sourceRef.current) {
            sourceRef.current.disconnect()
            sourceRef.current = null
        }
        if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
        }
        setIsAudioProcessing(false)
    }

    useEffect(() => {
        if (!isAudioProcessing || !analyserRef.current) {
            console.log("[VoiceDetection] Audio processing not ready, skipping...")
            return
        }

        let isMounted = true
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Float32Array(bufferLength)

        const detectNoise = () => {
            if (!isMounted || !analyserRef.current) return

            analyserRef.current.getFloatTimeDomainData(dataArray)

            let sum = 0
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i] * dataArray[i]
            }
            const rms = Math.sqrt(sum / bufferLength)
            console.log("[VoiceDetection] RMS Audio Level:", rms)

            if (rms > NOISE_THRESHOLD) {
                const currentTime = Date.now()
                setNoiseCount((prev) => {
                    const newCount = prev + 1
                    console.log(`[VoiceDetection] Noise detected, count: ${newCount}`)
                    if (currentTime - lastNoiseWarning >= WARNING_INTERVAL) {
                        toast.warning(`Noise detected (${newCount}/${NOISE_VIOLATION_LIMIT})`, {
                            description: "Please maintain silence during the test.",
                        })
                        setLastNoiseWarning(currentTime)
                        if (newCount >= NOISE_VIOLATION_LIMIT && !isNoisePopupOpen) {
                            setIsNoisePopupOpen(true)
                            setPopupCount((prev) => prev + 1)
                        }
                    }
                    return newCount
                })
            }

            requestAnimationFrame(detectNoise)
        }

        console.log("[VoiceDetection] Starting noise detection loop...")
        detectNoise()

        return () => {
            isMounted = false
            console.log("[VoiceDetection] Noise detection loop stopped.")
        }
    }, [isAudioProcessing, lastNoiseWarning])

    const handleCloseNoisePopup = () => {
        setIsNoisePopupOpen(false)
        setNoiseCount(0) // Reset noise count after popup
        if (popupCount >= NOISE_POPUP_LIMIT) {
            console.log("[VoiceDetection] Noise popup limit reached, terminating test")
            stopAudioProcessing()
            onNoiseDetected("Test terminated due to excessive noise detections.")
        }
    }

    return (
        <AlertDialog open={isNoisePopupOpen} onOpenChange={setIsNoisePopupOpen}>
            <AlertDialogContent className="bg-[#1e1e2e] text-white border-gray-700">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM11 7v4H9V7h2zm0 6v2H9v-2h2z" />
                        </svg>
                        Noise Detection Warning {popupCount}/{NOISE_POPUP_LIMIT}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                        Excessive noise has been detected. Please maintain silence during the test.
                        {popupCount >= NOISE_POPUP_LIMIT ? (
                            <p className="mt-2 font-bold text-red-400">This is your final warning. The test will now be terminated.</p>
                        ) : (
                            <p className="mt-2">You have {NOISE_POPUP_LIMIT - popupCount} chance(s) remaining before test termination.</p>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleCloseNoisePopup} className="bg-purple-500 hover:bg-purple-600">
                        {popupCount >= NOISE_POPUP_LIMIT ? "Close and Terminate" : "Understood"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default VoiceDetection
