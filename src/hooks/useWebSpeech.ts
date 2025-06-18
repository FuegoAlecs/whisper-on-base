import { useState, useEffect, useCallback } from 'react';

interface UseWebSpeechOptions {
  onSTTResult?: (transcript: string) => void;
  onSTTError?: (error: any) => void;
  onTTSFinisH?: () => void;
  onTTSError?: (error: any) => void;
}

export const useWebSpeech = (options?: UseWebSpeechOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [speechRecognition, setSpeechRecognition] = useState<any>(null); // Using 'any' for SpeechRecognition for now
  const [speechSynthesis, setSpeechSynthesis] = useState<any>(null); // Using 'any' for SpeechSynthesis for now
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    // Initialize SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Process speech after a pause
      recognition.interimResults = true; // Get interim results

      recognition.onstart = () => {
        setIsListening(true);
        setTranscribedText(''); // Clear previous transcript
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscribedText(finalTranscript || interimTranscript); // Show interim or final
        if (finalTranscript && options?.onSTTResult) {
          options.onSTTResult(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (options?.onSTTError) {
          options.onSTTError(event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    } else {
      console.warn('SpeechRecognition API not supported in this browser.');
    }

    // Initialize SpeechSynthesis
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      setSpeechSynthesis(synth);

      const loadVoices = () => {
        const availableVoices = synth.getVoices();
        console.log('[useWebSpeech] loadVoices: Available voices:', availableVoices);
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          // Attempt to select an English voice, preferably a local one
          const enVoice = availableVoices.find(voice => voice.lang.startsWith('en') && voice.localService) ||
                          availableVoices.find(voice => voice.lang.startsWith('en')) ||
                          availableVoices[0];
          setSelectedVoice(enVoice);
          console.log('[useWebSpeech] loadVoices: Selected voice:', enVoice);
        }
      };

      loadVoices();
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
        console.log('[useWebSpeech] useEffect: voiceschanged event listener attached.');
      } else {
         console.log('[useWebSpeech] useEffect: voiceschanged event not supported, voices might be preloaded or issue if not.');
      }

    } else {
      console.warn('[useWebSpeech] SpeechSynthesis API not supported in this browser.');
    }

    return () => {
      // Cleanup
      if (speechRecognition) {
        speechRecognition.stop();
      }
      // Get a reference to the current speechSynthesis state
      const currentSynth = window.speechSynthesis;
      if (currentSynth) {
        currentSynth.cancel();
        if (currentSynth.onvoiceschanged !== undefined) {
          currentSynth.onvoiceschanged = null; // Clean up listener
          console.log('[useWebSpeech] useEffect cleanup: voiceschanged event listener removed.');
        }
      }
    };
  }, [options]); // Removed speechSynthesis from dependency array as we set it here.

  const startListening = useCallback(() => {
    if (speechRecognition && !isListening) {
      try {
        speechRecognition.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        // This can happen if it's already started or due to other issues
        setIsListening(false); // Ensure state is correct
        if (options?.onSTTError) {
            options.onSTTError(error);
        }
      }
    } else if (!speechRecognition) {
        console.warn('SpeechRecognition not available.');
         if (options?.onSTTError) {
            options.onSTTError(new Error('SpeechRecognition not available.'));
        }
    }
  }, [speechRecognition, isListening, options]);

  const stopListening = useCallback(() => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
      // onend will set isListening to false
    }
  }, [speechRecognition, isListening, options]);

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    console.log('[useWebSpeech] speak: Called with text:', text, 'Lang:', lang);
    console.log('[useWebSpeech] speak: Current selected voice:', selectedVoice);

    if (!speechSynthesis) {
      console.warn('[useWebSpeech] speak: SpeechSynthesis not available. Cannot speak.');
      if (options?.onTTSError) {
        options.onTTSError(new Error('SpeechSynthesis not available.'));
      }
      return;
    }

    if (!text) {
      console.warn('[useWebSpeech] speak: No text provided to speak.');
      if (options?.onTTSError) {
        options.onTTSError(new Error('No text provided to speak.'));
      }
      return;
    }
    // It's possible selectedVoice is null if voices haven't loaded yet or no suitable voice found
    if (voices.length === 0 || !selectedVoice) {
      console.warn('[useWebSpeech] speak: Voices not loaded or no voice selected yet. Attempting to speak with browser default.');
      // Optionally, you could queue the message or notify the user,
      // but for now, we'll let it try with the browser's absolute default.
      // Or, if an error occurs consistently here, this is a point of failure.
    }

    console.log('[useWebSpeech] speak: SpeechSynthesis instance:', speechSynthesis);

    if (speechSynthesis.speaking) {
      console.log('[useWebSpeech] speak: SpeechSynthesis is currently speaking. Cancelling previous speech.');
      speechSynthesis.cancel(); // Stop any current speech before starting new
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Set language on utterance - this is still important
    utterance.lang = lang;

    // Explicitly set the voice if one is selected
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('[useWebSpeech] speak: Using voice:', selectedVoice.name, selectedVoice.lang);
    } else {
      console.warn('[useWebSpeech] speak: No specific voice selected, using browser default for lang:', lang);
    }

    utterance.onstart = () => {
      console.log('[useWebSpeech] speak: Utterance started.');
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      console.log('[useWebSpeech] speak: Utterance ended.');
      setIsSpeaking(false);
      if (options?.onTTSFinisH) {
        options.onTTSFinisH();
      }
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error('[useWebSpeech] speak: Utterance error.', event);
      setIsSpeaking(false);
      if (options?.onTTSError) {
        options.onTTSError(event.error || new Error(`SpeechSynthesisUtterance error: ${event.error}`));
      }
    };

    try {
      console.log('[useWebSpeech] speak: Attempting to speak utterance...');
      speechSynthesis.speak(utterance);
      console.log('[useWebSpeech] speak: speechSynthesis.speak() called.');
    } catch (e: any) {
      console.error('[useWebSpeech] speak: Error calling speechSynthesis.speak():', e);
      setIsSpeaking(false);
      if (options?.onTTSError) {
        options.onTTSError(e);
      }
    }
  }, [speechSynthesis, options, setIsSpeaking, selectedVoice, voices]);

  const cancelSpeaking = useCallback(() => {
    if (speechSynthesis && isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [speechSynthesis, isSpeaking]);

  return {
    isListening,
    isSpeaking,
    transcribedText,
    startListening,
    stopListening,
    speak,
    cancelSpeaking,
    isSTTSupported: !!speechRecognition,
    isTTSSupported: !!speechSynthesis,
  };
};
