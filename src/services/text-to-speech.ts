/**
 * Text-to-Speech Service
 * Uses browser-native Web Speech Synthesis API
 */

export interface TTSConfig {
    voice?: SpeechSynthesisVoice;
    rate?: number;  // 0.1 to 10, default 1
    pitch?: number; // 0 to 2, default 1
    volume?: number; // 0 to 1, default 1
    lang?: string;
}

class TextToSpeechService {
    private synth: SpeechSynthesis;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private config: TTSConfig = {
        rate: 1,
        pitch: 1,
        volume: 1,
        lang: 'en-US'
    };

    constructor() {
        this.synth = window.speechSynthesis;
    }

    /**
     * Check if text-to-speech is supported
     */
    isSupported(): boolean {
        return 'speechSynthesis' in window;
    }

    /**
     * Get available voices
     */
    getVoices(): SpeechSynthesisVoice[] {
        return this.synth.getVoices();
    }

    /**
     * Wait for voices to be loaded
     */
    async waitForVoices(): Promise<SpeechSynthesisVoice[]> {
        return new Promise((resolve) => {
            const voices = this.synth.getVoices();
            if (voices.length > 0) {
                resolve(voices);
                return;
            }

            // Wait for voiceschanged event
            this.synth.onvoiceschanged = () => {
                resolve(this.synth.getVoices());
            };

            // Timeout after 3 seconds
            setTimeout(() => {
                resolve(this.synth.getVoices());
            }, 3000);
        });
    }

    /**
     * Set configuration
     */
    setConfig(config: Partial<TTSConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Speak text
     */
    speak(
        text: string,
        config?: Partial<TTSConfig>,
        onEnd?: () => void,
        onError?: (error: string) => void
    ): void {
        if (!this.isSupported()) {
            onError?.('Text-to-speech not supported');
            return;
        }

        // Cancel any ongoing speech
        this.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const finalConfig = { ...this.config, ...config };

        // Apply configuration
        if (finalConfig.voice) {
            utterance.voice = finalConfig.voice;
        }
        utterance.rate = finalConfig.rate ?? 1;
        utterance.pitch = finalConfig.pitch ?? 1;
        utterance.volume = finalConfig.volume ?? 1;
        utterance.lang = finalConfig.lang ?? 'en-US';

        // Set up event handlers
        utterance.onend = () => {
            console.log('Speech finished');
            this.currentUtterance = null;
            onEnd?.();
        };

        utterance.onerror = (event) => {
            console.error('Speech error:', event);
            this.currentUtterance = null;
            onError?.(`Speech error: ${event.error}`);
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
    }

    /**
     * Pause speech
     */
    pause(): void {
        if (this.synth.speaking && !this.synth.paused) {
            this.synth.pause();
        }
    }

    /**
     * Resume speech
     */
    resume(): void {
        if (this.synth.paused) {
            this.synth.resume();
        }
    }

    /**
     * Cancel/stop speech
     */
    cancel(): void {
        this.synth.cancel();
        this.currentUtterance = null;
    }

    /**
     * Check if currently speaking
     */
    isSpeaking(): boolean {
        return this.synth.speaking;
    }

    /**
     * Check if currently paused
     */
    isPaused(): boolean {
        return this.synth.paused;
    }

    /**
     * Get preferred voice for language
     */
    getPreferredVoice(lang: string = 'en-US'): SpeechSynthesisVoice | undefined {
        const voices = this.getVoices();

        // Try to find a voice that matches the language
        let preferredVoice = voices.find(voice =>
            voice.lang === lang && voice.default
        );

        if (!preferredVoice) {
            preferredVoice = voices.find(voice =>
                voice.lang.startsWith(lang.split('-')[0])
            );
        }

        if (!preferredVoice && voices.length > 0) {
            preferredVoice = voices[0];
        }

        return preferredVoice;
    }
}

// Singleton instance
export const textToSpeechService = new TextToSpeechService();
