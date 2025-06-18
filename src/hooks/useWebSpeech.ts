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
      setSpeechSynthesis(window.speechSynthesis);
    } else {
      console.warn('SpeechSynthesis API not supported in this browser.');
    }

    return () => {
      // Cleanup
      if (speechRecognition) {
        speechRecognition.stop();
      }
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, [options]);

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
  }, [speechRecognition, isListening]);

  const speak = useCallback((text: string, lang: string = 'en-US') => {
    if (speechSynthesis && text) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel(); // Stop any current speech before starting new
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        if (options?.onTTSFinisH) {
          options.onTTSFinisH();
        }
      };
      utterance.onerror = (event: any) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        if (options?.onTTSError) {
          options.onTTSError(event.error);
        }
      };
      speechSynthesis.speak(utterance);
    } else if (!speechSynthesis) {
        console.warn('SpeechSynthesis not available.');
        if (options?.onTTSError) {
            options.onTTSError(new Error('SpeechSynthesis not available.'));
        }
    }
  }, [speechSynthesis, options]);

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
