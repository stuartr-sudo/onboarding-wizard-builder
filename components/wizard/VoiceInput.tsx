 'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, Square } from 'lucide-react'
import clsx from 'clsx'

interface VoiceInputProps {
  onTranscription: (text: string) => void
  disabled?: boolean
  className?: string
}

export default function VoiceInput({ onTranscription, disabled, className }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    if (disabled || isProcessing) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setIsProcessing(true)
        try {
          const formData = new FormData()
          formData.append('file', blob, 'recording.webm')

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (!res.ok) {
            console.error('Transcription failed', await res.text())
            return
          }

          const data = await res.json()
          if (data.text) {
            onTranscription(data.text)
          }
        } catch (error) {
          console.error('Transcription error:', error)
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Could not start recording:', error)
    }
  }

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return
    mediaRecorderRef.current.stop()
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
    setIsRecording(false)
  }

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      className={clsx(
        'absolute inset-y-0 right-0 flex items-center pr-3',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      <span
        className={clsx(
          'inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium shadow-sm transition-colors',
          isRecording
            ? 'border-red-500 bg-red-500 text-white'
            : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700'
        )}
      >
        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </span>
    </button>
  )
}

