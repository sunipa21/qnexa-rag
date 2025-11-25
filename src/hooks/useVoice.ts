import { useState, useCallback, useRef, useEffect } from 'react';
import { speechRecognitionService } from '../services/speech-recognition';

export interface UseVoiceResult {
    isListening: boolean;
    transcript: string;
    interimTranscript: string;
    error: string | null;
    isSupported: boolean;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

export interface UseVoiceOptions {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
    onTranscriptComplete?: (transcript: string) => void;
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceResult {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported] = useState(() => speechRecognitionService.isSupported());

    const timeoutRef = useRef<number>();

    const {
        language = 'en-US',
        continuous = false,
        interimResults = true,
        onTranscriptComplete
    } = options;

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setError(null);
    }, []);

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('Speech recognition is not supported in this browser');
            return;
        }

        setError(null);
        resetTranscript();

        speechRecognitionService.start(
            {
                language,
                continuous,
                interimResults
            },
            (text, isFinal) => {
                if (isFinal) {
                    setTranscript(prev => {
                        const newTranscript = prev ? `${prev} ${text}` : text;

                        // Clear timeout if exists
                        if (timeoutRef.current) {
                            window.clearTimeout(timeoutRef.current);
                        }

                        // If not continuous, trigger completion after a short delay
                        if (!continuous) {
                            timeoutRef.current = window.setTimeout(() => {
                                onTranscriptComplete?.(newTranscript.trim());
                            }, 500);
                        }

                        return newTranscript;
                    });
                    setInterimTranscript('');
                } else {
                    setInterimTranscript(text);
                }
            },
            (errorMsg) => {
                setError(errorMsg);
                setIsListening(false);
            },
            () => {
                setIsListening(false);

                // If continuous mode and we have transcript, trigger completion
                if (continuous && transcript) {
                    onTranscriptComplete?.(transcript.trim());
                }
            }
        );

        setIsListening(true);
    }, [isSupported, language, continuous, interimResults, onTranscriptComplete, resetTranscript, transcript]);

    const stopListening = useCallback(() => {
        speechRecognitionService.stop();
        setIsListening(false);

        // Clear any pending timeouts
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }

        // Trigger completion if we have a transcript
        const finalTranscript = transcript || interimTranscript;
        if (finalTranscript) {
            onTranscriptComplete?.(finalTranscript.trim());
        }
    }, [transcript, interimTranscript, onTranscriptComplete]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            speechRecognitionService.abort();
        };
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        error,
        isSupported,
        startListening,
        stopListening,
        resetTranscript
    };
}
