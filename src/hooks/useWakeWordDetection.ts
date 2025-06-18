import { useEffect, useState, useCallback } from 'react';
import { usePorcupine } from '@picovoice/porcupine-react';

const PICOVOICE_ACCESS_KEY = 'cZDyFlz2yFDXbMoIHh3fsbCc1Kz/9l3z/FAGE66aL4pIw6NWbFjsqA==';

// IMPORTANT: User needs to confirm these paths and filenames
const CUSTOM_WAKE_WORD_FILE_PATH = 'picovoice_models/Hey-Chain-Whisper_en_wasm_v3_0_0.ppn';
const PORCUPINE_MODEL_FILE_PATH = 'picovoice_models/porcupine_params.pv';

const WAKE_WORD_LABEL = 'HeyChainWhisper'; // Label for your custom wake word

interface WakeWordDetectionHook {
  isLoaded: boolean;
  isListening: boolean;
  error: Error | null;
  isError: boolean;
  startWakeWordDetection: () => Promise<void>;
  stopWakeWordDetection: () => Promise<void>;
  keywordDetection: any;
}

export const useWakeWordDetection = (
  onWakeWordDetected: () => void
): WakeWordDetectionHook => {
  const [isMounted, setIsMounted] = useState(true);

  const {
    keywordDetection,
    isLoaded,
    isListening,
    error,
    init,
    start,
    stop,
    release,
  } = usePorcupine();

  // Log the error from usePorcupine when it changes
  useEffect(() => {
    if (error) {
      console.error('[useWakeWordDetection] Detailed Porcupine Hook Error:', error);
      // You can log specific properties if known, e.g., error.name, error.message, error.stack
      // For WebAssembly errors, sometimes more info is in error.toString() or nested properties
      if (error.message) {
        console.error('[useWakeWordDetection] Error Message:', error.message);
      }
      if (error.stack) {
        console.error('[useWakeWordDetection] Error Stack:', error.stack);
      }
    }
  }, [error]);

  const initPorcupine = useCallback(async () => {
    if (!PICOVOICE_ACCESS_KEY) {
      console.error('[useWakeWordDetection] Picovoice AccessKey is not set.');
      return;
    }
    try {
      console.log(`[useWakeWordDetection] Initializing Porcupine with AccessKey: ${PICOVOICE_ACCESS_KEY.substring(0, 5)}...`);
      console.log(`[useWakeWordDetection] Custom PPN Path: ${CUSTOM_WAKE_WORD_FILE_PATH}`);
      console.log(`[useWakeWordDetection] Model PV Path: ${PORCUPINE_MODEL_FILE_PATH}`);
      await init(
        PICOVOICE_ACCESS_KEY,
        [
          {
            publicPath: CUSTOM_WAKE_WORD_FILE_PATH,
            label: WAKE_WORD_LABEL,
            // sensitivity: 0.7 // Optional: Adjust sensitivity
          },
        ],
        { publicPath: PORCUPINE_MODEL_FILE_PATH }
      );
      if (isMounted) { // Check if component is still mounted
         console.log('[useWakeWordDetection] Porcupine initialized successfully (according to init call completion).');
      }
    } catch (e: any) {
      // This catch block might catch errors from the init call itself,
      // but the `error` state from the usePorcupine hook is often more informative
      // for internal Porcupine errors.
      console.error('[useWakeWordDetection] Error caught during init() call for Porcupine:', e);
      if (e.message) {
        console.error('[useWakeWordDetection] Init Error Message:', e.message);
      }
      if (e.stack) {
        console.error('[useWakeWordDetection] Init Error Stack:', e.stack);
      }
       if (isMounted && !error) { // If hook's error state isn't set yet, this one is primary
            // This part might be tricky as the hook's error state might update slightly after this catch.
            // The useEffect above is more reliable for the hook's own error state.
       }
    }
  }, [init, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    initPorcupine();

    return () => {
      setIsMounted(false);
      console.log('[useWakeWordDetection] Releasing Porcupine resources.');
      release();
    };
  }, [initPorcupine, release]);

  useEffect(() => {
    if (isMounted && keywordDetection !== null && keywordDetection.label === WAKE_WORD_LABEL) {
      console.log(`[useWakeWordDetection] Wake word '{WAKE_WORD_LABEL}' detected!`);
      onWakeWordDetected();
    }
  }, [keywordDetection, onWakeWordDetected, isMounted]);

  const startWakeWordDetection = useCallback(async () => {
    if (isLoaded && !isListening) {
      try {
        console.log('[useWakeWordDetection] Starting wake word detection...');
        await start();
        console.log('[useWakeWordDetection] Wake word detection started.');
      } catch (e: any) {
        console.error('[useWakeWordDetection] Error starting wake word detection:', e);
      }
    } else if (!isLoaded) {
        console.warn('[useWakeWordDetection] Porcupine not loaded yet, cannot start.');
    } else if (isListening) {
        console.warn('[useWakeWordDetection] Already listening for wake word.');
    }
  }, [isLoaded, isListening, start]);

  const stopWakeWordDetection = useCallback(async () => {
    if (isListening) {
      try {
        console.log('[useWakeWordDetection] Stopping wake word detection...');
        await stop();
        console.log('[useWakeWordDetection] Wake word detection stopped.');
      } catch (e: any) {
        console.error('[useWakeWordDetection] Error stopping wake word detection:', e);
      }
    }
  }, [isListening, stop]);

  return {
    isLoaded,
    isListening,
    error,
    isError: error !== null,
    startWakeWordDetection,
    stopWakeWordDetection,
    keywordDetection,
  };
};
