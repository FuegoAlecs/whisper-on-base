# Testing Voice Features (Web Speech API)

This document outlines the manual testing steps for the integrated speech-to-text (STT) and text-to-speech (TTS) functionalities.

**Browser Compatibility:**
- [ ] Test in Google Chrome (desktop).
- [ ] Test in Mozilla Firefox (desktop). (Note: Firefox may have different levels of Web Speech API support or require specific flags).
- [ ] Test in Microsoft Edge (Chromium-based, desktop).
- [ ] Test on a mobile browser (e.g., Chrome on Android, Safari on iOS). (Note: Mobile support can vary significantly).

**Prerequisites:**
- Ensure you have a working microphone.
- When prompted by the browser, grant microphone permission for the site.

**I. Speech-to-Text (STT) Functionality - `ChatWindow.tsx`**

1.  **API Support & UI:**
    - [ ] **STT Not Supported:** If using a browser that doesn't support STT, verify that a toast notification "Speech Recognition Not Supported" appears once per session. The microphone button should be disabled, and its tooltip should indicate "Speech input not supported".
    - [ ] **STT Supported:** If STT is supported, the microphone button should be enabled (when not loading/speaking).
2.  **Microphone Button & Listening State:**
    - [ ] Click the microphone button:
        - [ ] Verify the icon changes (e.g., to `MicOff` or a "listening" indicator).
        - [ ] Verify the tooltip changes to "Stop voice input".
        - [ ] Verify the main text input field might show some indication of listening (if implemented, otherwise, focus on transcription).
        - [ ] Verify the Send button is disabled while listening.
    - [ ] Speak a phrase.
    - [ ] Click the microphone button again (or wait for STT to auto-stop if `continuous=false` was set and it stops on pause):
        - [ ] Verify the icon changes back to the default microphone icon.
        - [ ] Verify the tooltip changes back to "Use microphone".
        - [ ] Verify the Send button is re-enabled.
3.  **Transcription:**
    - [ ] Speak clearly: Verify the spoken text accurately appears in the input field.
    - [ ] Speak with some background noise: Assess transcription accuracy.
    - [ ] Speak a long sentence: Verify the transcription handles it.
    - [ ] Speak, pause, then speak again (if `continuous=false`): Verify it captures the speech after the pause correctly or stops and finalizes after the first utterance. (The current hook is `continuous=false`, `interimResults=true`).
    - [ ] Verify `interimResults` update the input field if visually noticeable, and then the final result replaces it.
4.  **Error Handling (STT):**
    - [ ] **Microphone Permission Denied:**
        - Revoke microphone permission for the site (via browser settings).
        - Click the microphone button.
        - [ ] Verify an error toast "Speech Recognition Error" appears with a message like "Could not start microphone... Please ensure microphone access is allowed...".
        - Re-grant permission and test again.
    - [ ] **No Speech Detected:** Start listening but don't say anything. Verify the STT service times out gracefully (browser behavior) and `onerror` or `onend` is handled without crashing. The `isListening` state should reset.

**II. Text-to-Speech (TTS) Functionality**

1.  **API Support & UI:**
    - [ ] **TTS Not Supported:** If using a browser that doesn't support TTS, verify that a toast notification "Text-to-Speech Not Supported" appears once per session.
    - [ ] **TTS Supported:** Speaker icons should appear on AI messages.
2.  **Automatic TTS for AI Responses (`ChatWindow.tsx`):**
    - [ ] Send a message to the AI.
    - [ ] When the AI response appears, verify it's automatically spoken out loud (if TTS is supported).
    - [ ] If another AI response comes in while the previous one is still speaking, verify the previous speech is cancelled and the new one starts.
3.  **Manual TTS Replay on AI Messages (`ChatMessage.tsx`):**
    - [ ] For an AI message, click the speaker icon next to it.
        - [ ] Verify the message text is spoken out loud.
    - [ ] Click the speaker icon on one message, and while it's speaking, click the speaker icon on another AI message.
        - [ ] Verify the first message stops speaking and the second one starts.
    - [ ] Click the speaker icon, and while it's speaking, send a new message that triggers an automatic AI response with TTS.
        - [ ] Verify the manually triggered speech stops and the new automatic TTS for the latest AI response plays.
4.  **Error Handling (TTS):**
    - [ ] **TTS Engine Error (Simulate if possible, or observe):** If the TTS engine encounters an issue, verify an error toast "Speech Synthesis Error" appears. (This is hard to reliably reproduce).

**III. General UI/UX:**
- [ ] **Button States:** Verify microphone and send buttons are appropriately enabled/disabled during STT listening, AI response loading, etc.
- [ ] **Tooltips:** Verify all relevant tooltips on buttons provide clear information.
- [ ] **Responsiveness:** Check the layout of the microphone button and input field on different screen sizes (if applicable to the changes made).
- [ ] **No Console Errors:** Open the browser's developer console and monitor for any uncaught errors during STT/TTS operations.

This checklist will help ensure the quality and correctness of the voice integration.
