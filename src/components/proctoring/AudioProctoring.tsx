"use client"

import React, { useRef, useEffect, useState } from "react"
import { toast } from "sonner"

interface AudioProctoringProps {
    active: boolean
    stream: MediaStream | null
}

const AudioProctoring: React.FC<AudioProctoringProps> = ({ active, stream }) => {
    const [isAudioProctoring, setIsAudioProctoring] = useState<boolean>(false)
    const [audioViolationCount, setAudioViolationCount] = useState<number>(0)
    const [lastAudioWarning, setLastAudioWarning] = useState<number>(0)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const WARNING_INTERVAL: number = 5000
    const AUDIO_THRESHOLD: number = 0.1
    const FFT_SIZE: number = 128

    useEffect(() => {
        if (!active || !stream) {
            console.log("[AudioProctoring] Inactive or no stream, skipping setup.")
            return
        }

        const audioTracks = stream.getAudioTracks()
        if (audioTracks.length === 0 || !audioTracks[0].enabled) {
            console.log("[AudioProctoring] No active audio track in stream.")
            toast.error("Audio Proctoring Failed", {
                description: "No audio track available. Please ensure your microphone is enabled.",
            })
            return
        }

        const setupAudioProctoring = async () => {
            console.log("[AudioProctoring] Setting up...")
            try {
                const audioContext = new AudioContext()
                await audioContext.resume()
                console.log("[AudioProctoring] AudioContext state:", audioContext.state)

                const analyser = audioContext.createAnalyser()
                analyser.fftSize = FFT_SIZE
                const source = audioContext.createMediaStreamSource(stream)
                source.connect(analyser)

                audioContextRef.current = audioContext
                analyserRef.current = analyser
                sourceRef.current = source

                console.log("[AudioProctoring] Audio context and analyser set up.")
                setIsAudioProctoring(true)
            } catch (err: unknown) {
                const error = err as Error
                console.error("[AudioProctoring] Setup failed:", error.message)
                toast.error("Audio Proctoring Setup Failed", {
                    description: "Unable to access microphone. Please allow access.",
                })
            }
        }

        setupAudioProctoring()

        return () => {
            console.log("[AudioProctoring] Cleaning up...")
            if (sourceRef.current) {
                sourceRef.current.disconnect()
                console.log("[AudioProctoring] MediaStreamSource disconnected.")
            }
            if (audioContextRef.current) {
                audioContextRef.current.close()
                console.log("[AudioProctoring] Audio context closed.")
            }
            setIsAudioProctoring(false)
            audioContextRef.current = null
            analyserRef.current = null
            sourceRef.current = null
        }
    }, [active, stream])

    useEffect(() => {
        if (!isAudioProctoring || !active || !analyserRef.current) {
            console.log(
                "[AudioProctoring] Audio detection skipped: isAudioProctoring =",
                isAudioProctoring,
                "active =",
                active,
                "analyser =",
                analyserRef.current
            )
            return
        }

        let isMounted = true
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Float32Array(bufferLength)

        const detectAudio = () => {
            if (!isMounted || !analyserRef.current) return

            analyserRef.current.getFloatTimeDomainData(dataArray)

            let sum = 0
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i] * dataArray[i]
            }
            const rms = Math.sqrt(sum / bufferLength)

            console.log("[AudioProctoring] RMS audio level:", rms)

            const currentTime = Date.now()
            if (rms > AUDIO_THRESHOLD) {
                setAudioViolationCount((prev) => {
                    const newCount = prev + 1
                    console.log(`[AudioProctoring] Audio violation count: ${newCount}, RMS: ${rms}`)
                    if (currentTime - lastAudioWarning >= WARNING_INTERVAL) {
                        toast.warning(`Audio detected (${newCount})`, {
                            description: "Please avoid making noise during the test.",
                        })
                        setLastAudioWarning(currentTime)
                    }
                    return newCount
                })
            }

            requestAnimationFrame(detectAudio)
        }

        console.log("[AudioProctoring] Starting audio detection loop...")
        detectAudio()

        return () => {
            isMounted = false
            console.log("[AudioProctoring] Audio detection loop stopped.")
        }
    }, [isAudioProctoring, active, lastAudioWarning])

    return null
}

export default AudioProctoring