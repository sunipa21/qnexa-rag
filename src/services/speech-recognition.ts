/**
 * Speech Recognition Service
 * Supports browser-native Web Speech API for accurate voice input
 */

export type SpeechRecognitionCallback = (transcript: string, isFinal: boolean) => void;
export type SpeechErrorCallback = (error: string) => void;

export interface SpeechRecognitionConfig {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
    maxAlternatives?: number;
}

class SpeechRecognitionService {
    private recognition: any = null;
    private isListening = false;
    private onTranscriptCallback?: SpeechRecognitionCallback;
    private onErrorCallback?: SpeechErrorCallback;
    private onEndCallback?: () => void;

    constructor() {
        this.initializeRecognition();
    }

    private initializeRecognition(): void {
        // Check for Web Speech API support
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
    }

    /**
     * Check if speech recognition is supported
     */
    isSupported(): boolean {
        return this.recognition !== null;
    }

    /**
     * Start speech recognition
     */
    start(
        config: SpeechRecognitionConfig = {},
        onTranscript: SpeechRecognitionCallback,
        onError?: SpeechErrorCallback,
        onEnd?: () => void
    ): void {
        if (!this.recognition) {
            onError?.('Speech recognition not supported');
            return;
        }

        if (this.isListening) {
            this.stop();
        }

        // Configure recognition
        this.recognition.lang = config.language || 'en-US';
        this.recognition.continuous = config.continuous ?? false;
        this.recognition.interimResults = config.interimResults ?? true;
        this.recognition.maxAlternatives = config.maxAlternatives ?? 1;

        this.onTranscriptCallback = onTranscript;
        this.onErrorCallback = onError;
        this.onEndCallback = onEnd;

        // Set up event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('Speech recognition started');
        };

        this.recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                this.onTranscriptCallback?.(finalTranscript.trim(), true);
            } else if (interimTranscript) {
                this.onTranscriptCallback?.(interimTranscript, false);
            }
        };

        this.recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            let errorMessage = 'Speech recognition error';

            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage = 'Microphone not found or not accessible.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone permission denied.';
                    break;
                case 'network':
                    errorMessage = 'Network error occurred.';
                    break;
                default:
                    errorMessage = `Error: ${event.error}`;
            }

            this.onErrorCallback?.(errorMessage);
            this.isListening = false;
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('Speech recognition ended');
            this.onEndCallback?.();
        };

        // Start recognition
        try {
            this.recognition.start();
        } catch (error: any) {
            console.error('Error starting speech recognition:', error);
            this.onErrorCallback?.('Failed to start speech recognition');
            this.isListening = false;
        }
    }

    /**
     * Stop speech recognition
     */
    stop(): void {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Error stopping speech recognition:', error);
            }
        }
        this.isListening = false;
    }

    /**
     * Abort speech recognition immediately
     */
    abort(): void {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.abort();
            } catch (error) {
                console.error('Error aborting speech recognition:', error);
            }
        }
        this.isListening = false;
    }

    /**
     * Check if currently listening
     */
    getIsListening(): boolean {
        return this.isListening;
    }
}

// Singleton instance
export const speechRecognitionService = new SpeechRecognitionService();
