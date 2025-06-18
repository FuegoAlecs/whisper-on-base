import { useEffect, useState, useCallback } from 'react';
import { useCheetah } from '@picovoice/cheetah-react';

// Use the same AccessKey as for Porcupine
const PICOVOICE_ACCESS_KEY = 'HTKSr5YAOspvXSR/Ag5GjK7L1Kn+q/lIfjuQrvOsBmz+SEaBE3chFw==';

// Path to the Cheetah model file (user needs to download this)
const CHEETAH_MODEL_FILE_PATH = '/picovoice_models/cheetah_params.pv';

interface PicovoiceSTTHook {
  transcript: string;
  finalTranscript: string;
  isLoaded: boolean;
  isListening: boolean;
  error: Error | null;
  isError: boolean;
  startSTT: () => Promise<void>;
  stopSTT: () => Promise<void>;
  releaseSTT: () => Promise<void>;
}

export const usePicovoiceSTT = (): PicovoiceSTTHook => {
  const [isMounted, setIsMounted] = useState(true);
  const [currentTranscriptSegment, setCurrentTranscriptSegment] = useState(''); // Current segment being built
  const [fullFinalizedTranscript, setFullFinalizedTranscript] = useState(''); // Accumulates all finalized segments

  const {
    result,
    isLoaded,
    isListening,
    error,
    init,
    start,
    stop,
    release,
  } = useCheetah();

  useEffect(() => {
    if (error) {
      console.error('[usePicovoiceSTT] Detailed Cheetah Hook Error:', error);
      if (error.message) {
        console.error('[usePicovoiceSTT] Error Message:', error.message);
      }
    }
  }, [error]);

  const initCheetah = useCallback(async () => {
    if (!PICOVOICE_ACCESS_KEY) {
      console.error('[usePicovoiceSTT] Picovoice AccessKey is not set.');
      return;
    }
    try {
      console.log(`[usePicovoiceSTT] Initializing Cheetah with AccessKey: ${PICOVOICE_ACCESS_KEY.substring(0, 5)}...`);
      console.log(`[usePicovoiceSTT] Cheetah Model Path: ${CHEETAH_MODEL_FILE_PATH}`);
      await init(
        PICOVOICE_ACCESS_KEY,
        {
          publicPath: CHEETAH_MODEL_FILE_PATH,
          endpointDurationSec: 0.8, // Slightly shorter endpoint duration
          enableAutomaticPunctuation: true,
        }
      );
      if (isMounted) {
        console.log('[usePicovoiceSTT] Cheetah initialized successfully.');
      }
    } catch (e: any) {
      console.error('[usePicovoiceSTT] Error caught during init() call for Cheetah:', e);
      if (e.message) {
        console.error('[usePicovoiceSTT] Init Error Message:', e.message);
      }
    }
  }, [init, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    initCheetah();
    return () => {
      setIsMounted(false);
      console.log('[usePicovoiceSTT] Releasing Cheetah resources.');
      release();
    };
  }, [initCheetah, release]);

  useEffect(() => {
    if (result) {
      // console.log('[usePicovoiceSTT] Cheetah Result:', result); // Can be noisy
      if (result.transcript) {
        setCurrentTranscriptSegment(prev => `${prev}${result.transcript}`);
      }

      if (result.isEndpoint) {
        console.log('[usePicovoiceSTT] Endpoint detected. Finalizing transcript segment:', currentTranscriptSegment);
        if (currentTranscriptSegment.trim()) { // Ensure there's something to add
          setFullFinalizedTranscript(prev => (prev ? `${prev} ${currentTranscriptSegment.trim()}` : currentTranscriptSegment.trim()).trim());
        }
        setCurrentTranscriptSegment(''); // Reset for next segment
      }
    }
  }, [result]);

  const startSTT = useCallback(async () => {
    if (isLoaded && !isListening) {
      try {
        console.log('[usePicovoiceSTT] Starting STT...');
        setCurrentTranscriptSegment('');
        setFullFinalizedTranscript('');
        await start();
        console.log('[usePicovoiceSTT] STT started.');
      } catch (e: any) {
        console.error('[usePicovoiceSTT] Error starting STT:', e);
      }
    } else if (!isLoaded) {
      console.warn('[usePicovoiceSTT] Cheetah not loaded yet, cannot start STT.');
    } else if (isListening) {
      console.warn('[usePicovoiceSTT] STT already listening.');
    }
  }, [isLoaded, isListening, start]);

  const stopSTT = useCallback(async () => {
    if (isListening) {
      try {
        console.log('[usePicovoiceSTT] Stopping STT...');
        await stop(); // This should trigger a final result with isEndpoint=true if there's pending audio
        console.log('[usePicovoiceSTT] STT stopped.');
        // Process any remaining currentTranscriptSegment after stop, as the final `result` event with isEndpoint might handle it.
        // If not, this ensures it's captured.
        if (currentTranscriptSegment.trim()) {
            setFullFinalizedTranscript(prev => (prev ? `${prev} ${currentTranscriptSegment.trim()}` : currentTranscriptSegment.trim()).trim());
            setCurrentTranscriptSegment('');
        }
      } catch (e: any) {
        console.error('[usePicovoiceSTT] Error stopping STT:', e);
      }
    }
  }, [isListening, stop, currentTranscriptSegment]);

  const releaseSTT = useCallback(async () => {
      console.log('[usePicovoiceSTT] Explicitly releasing Cheetah resources.');
      await release();
  }, [release]);

  // The main transcript to be used by ChatWindow would be the accumulating fullFinalizedTranscript,
  // potentially appended with the live currentTranscriptSegment if we want real-time updates in the input.
  // For now, let's primarily expose the fullFinalizedTranscript and the live segment separately.
  // ChatWindow can decide how to combine them.

  // Let's refine the returned transcript:
  // `transcript` will be the full text so far (finalized)
  // `partialTranscript` will be the current live segment after the last finalization.
  // This might be more useful for ChatWindow.

  const liveTranscript = (fullFinalizedTranscript ? fullFinalizedTranscript + ' ' : '') + currentTranscriptSegment;


  return {
    transcript: liveTranscript.trim(), // This provides the most "live" feel
    finalTranscript: fullFinalizedTranscript, // This is the transcript after last endpoint
    isLoaded,
    isListening,
    error,
    isError: error !== null,
    startSTT,
    stopSTT,
    releaseSTT,
  };
};
