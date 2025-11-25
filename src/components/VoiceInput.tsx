import React, { useEffect } from 'react';
import { useVoice } from '../hooks/useVoice';

interface VoiceInputProps {
    onTranscript: (transcript: string) => void;
    onInterimTranscript?: (transcript: string) => void;
    language?: string;
    disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
    onTranscript,
    onInterimTranscript,
    language = 'en-US',
    disabled = false
}) => {
    const {
        isListening,
        transcript,
        interimTranscript,
        error,
        isSupported,
        startListening,
        stopListening
    } = useVoice({
        language,
        continuous: false,
        interimResults: true,
        onTranscriptComplete: onTranscript
    });

    // Pass interim transcript to parent so it appears in textarea
    useEffect(() => {
        const currentText = interimTranscript || transcript;
        if (currentText && onInterimTranscript) {
            onInterimTranscript(currentText);
        }
    }, [interimTranscript, transcript, onInterimTranscript]);

    const handleClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (!isSupported) {
        return null; // Don't show button if not supported
    }

    return (
        <div className="voice-input-container">
            <button
                className={`voice-button ${isListening ? 'listening' : ''}`}
                onClick={handleClick}
                disabled={disabled}
                title={isListening ? 'Stop recording' : 'Start voice input'}
                type="button"
            >
                {isListening ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="20"
                        height="20"
                    >
                        <path d="M6 6h12v12H6z" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="20"
                        height="20"
                    >
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                )}
            </button>

            {error && (
                <div className="voice-error">
                    <span>⚠️ {error}</span>
                </div>
            )}
        </div>
    );
};
