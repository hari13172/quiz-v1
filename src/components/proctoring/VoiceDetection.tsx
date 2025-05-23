"use client"

import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"

interface VoiceDetectionProps {
    active: boolean
    threshold?: number // dB threshold for noise detection
    onNoiseDetected?: (reason: string) => void // Callback for termination with reason
    stream: MediaStream | null
}

export function VoiceDetection({ active, threshold = -50, onNoiseDetected, }: VoiceDetectionProps) {
    const [isMonitoring, setIsMonitoring] = useState(false)
    const [violationCount, setViolationCount] = useState(0)
    const [lastWarningTime, setLastWarningTime] = useState(0)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const rafRef = useRef<number | null>(null)
    const VIOLATION_LIMIT = 3
    const WARNING_COOLDOWN = 5000 // 5 seconds in milliseconds

    // Start audio monitoring
    const startMonitoring = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream
            console.log("[VoiceDetection] Audio tracks:", stream.getAudioTracks())

            const audioContext = new AudioContext()
            await audioContext.resume()
            audioContextRef.current = audioContext

            const source = audioContext.createMediaStreamSource(stream)
            const analyser = audioContext.createAnalyser()
            analyser.fftSize = 2048
            analyserRef.current = analyser

            source.connect(analyser)

            setIsMonitoring(true)
            monitorAudio()
        } catch (error) {
            console.error("[VoiceDetection] Error accessing microphone:", error)
            toast.error("Microphone Access Denied", {
                description: "Please allow microphone access to proceed with the test.",
            })
            onNoiseDetected?.("Microphone access denied.")
        }
    }

    // Stop audio monitoring
    const stopMonitoring = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }
        if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
        }
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        setIsMonitoring(false)
        setViolationCount(0)
        setLastWarningTime(0)
    }

    // Monitor audio levels
    const monitorAudio = () => {
        if (!analyserRef.current || !isMonitoring) return

        const dataArray = new Float32Array(analyserRef.current.fftSize)
        analyserRef.current.getFloatTimeDomainData(dataArray)

        // Calculate RMS (Root Mean Square) to estimate volume
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i]
        }
        const rms = Math.sqrt(sum / dataArray.length)

        // Convert RMS to dB
        const db = 20 * Math.log10(rms + 0.00001) // Avoid log(0)
        console.log(`[VoiceDetection] Audio level: ${db.toFixed(2)} dB`)

        // Check if noise exceeds threshold
        const currentTime = Date.now()
        if (db > threshold && currentTime - lastWarningTime >= WARNING_COOLDOWN) {
            setViolationCount((prev) => {
                const newCount = prev + 1
                console.log(`[VoiceDetection] Noise violation ${newCount}/${VIOLATION_LIMIT}: ${db.toFixed(2)} dB`)

                if (newCount <= VIOLATION_LIMIT) {
                    toast.warning(`Background Noise Detected (${newCount}/${VIOLATION_LIMIT})`, {
                        description:
                            newCount < VIOLATION_LIMIT
                                ? "Excessive noise detected. Please keep your environment quiet."
                                : "Final warning: Further noise will terminate the test.",
                    })
                    setLastWarningTime(currentTime)
                }

                if (newCount >= VIOLATION_LIMIT) {
                    toast.error("Test Terminated", {
                        description: "Excessive background noise detected multiple times.",
                    })
                    onNoiseDetected?.("Excessive background noise detected after multiple warnings.")
                    stopMonitoring()
                    return prev // Avoid updating state after termination
                }

                return newCount
            })
        }

        // Continue monitoring
        rafRef.current = requestAnimationFrame(monitorAudio)
    }

    useEffect(() => {
        if (active) {
            startMonitoring()
        } else {
            stopMonitoring()
        }

        return () => {
            stopMonitoring()
        }
    }, [active])

    return null
}