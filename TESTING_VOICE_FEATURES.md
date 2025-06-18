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

**II.A. Verifying TTS Fixes and AI Audio Interaction**

After recent changes to improve TTS reliability, please pay close attention to the following:

- [ ] **AI Responds with Voice:** Confirm that when the AI sends a message, its response is clearly spoken out loud by the system.
- [ ] **No "Speech Synthesis Error":** Verify that the previously reported "speech synthesis error couldn't play audio" toast message no longer appears during normal operation.
- [ ] **Check Console Logs if Issues Persist:**
    - If AI responses are not spoken, or if you encounter any audio errors:
        1. Open your browser's Developer Console (usually by pressing F12).
        2. Look for log messages prefixed with `[useWebSpeech]` or `[ChatWindow]`. These logs provide details about:
            - Whether the `speak` function was called.
            - The text intended for speech.
            - Availability of `speechSynthesis` and `isTTSSupported` status.
            - Voice loading and selection process (available voices, selected voice).
            - Any errors caught during utterance playback (`utterance.onerror`).
        3. Note down any error messages or unexpected behavior reported in these logs to help with further debugging.

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

---
*(The "---" separator was here, I'm removing it as General UI/UX will be moved to the end)*

**III. Wake Word Functionality ("Hey, ChainWhisper")**
*(This was IV, and the new section V will follow this)*

This section covers testing for the "Hey, ChainWhisper" wake word detection feature powered by Picovoice Porcupine.

**A. Prerequisites & Setup (Developer/Tester Checks):**

- [ ] **Model Files:** Ensure your custom wake word model file (e.g., `YOUR_CUSTOM_WAKE_WORD.ppn` - *replace with actual filename used during development*) and the generic `porcupine_params.pv` file are correctly placed in the `public/picovoice_models/` directory of the application.
- [ ] **AccessKey:** Verify the Picovoice `ACCESS_KEY` is correctly set in `src/hooks/useWakeWordDetection.ts`.
- [ ] **Initial Load:** Be aware that the wake word engine might take a few moments to load when the page is first loaded/refreshed, or when the toggle is first enabled. Check for "(Wake word engine loading...)" status.

**B. Toggle Switch and UI Indicators:**

- [ ] **Visibility:** Confirm the "Enable 'Hey, ChainWhisper'" toggle switch and its label are visible in the chat interface (typically above the input area).
- [ ] **Tooltip:** Hover over/focus on the toggle switch. Verify a tooltip appears explaining its function and that the microphone will be active.
- [ ] **Enable Toggle:**
    - [ ] Click the switch to the "on" position.
    - [ ] If the engine wasn't loaded, observe the status text showing "(Wake word engine loading...)".
    - [ ] Once loaded and active, verify the status text changes to "(Listening for wake word...)".
- [ ] **Disable Toggle:**
    - [ ] Click the switch to the "off" position.
    - [ ] Verify the "(Listening for wake word...)" status text disappears or changes to an "off" state.
    - [ ] Confirm (by attempting to speak the wake word) that detection has stopped.

**C. Wake Word Detection:**

- [ ] **Activation:**
    - [ ] Enable the "Hey, ChainWhisper" toggle.
    - [ ] Ensure the status indicates it's listening.
    - [ ] Clearly speak the phrase "Hey, ChainWhisper".
- [ ] **STT Trigger:**
    - [ ] Verify that upon successful wake word detection, the main Speech-to-Text (STT) service activates (e.g., the microphone icon in the input bar changes, indicating the app is now listening for a command/query).
- [ ] **State After STT:**
    - [ ] After the main STT (command capture) session ends (either by sending the message or by timeout/cancellation):
        - [ ] Verify that if the "Hey, ChainWhisper" toggle is still enabled, the "(Listening for wake word...)" status resumes.

**D. Interaction with Manual STT Activation:**

- [ ] **Enable Wake Word:** Turn the "Hey, ChainWhisper" toggle on. Verify it's listening.
- [ ] **Manual STT Start:** Click the main microphone button in the input bar to manually activate STT.
    - [ ] Verify that the "(Listening for wake word...)" status disappears or indicates that wake word detection is paused.
- [ ] **Manual STT Stop:** Stop the manual STT (e.g., by clicking the mic button again or sending a message).
    - [ ] Verify that the "(Listening for wake word...)" status resumes automatically (if the toggle is still enabled).

**E. Error Handling (Primarily Developer Checks, but observe UI):**

- [ ] **Simulate Incorrect Setup (Developer Task):**
    - Temporarily rename or remove one of the model files (`.ppn` or `.pv`) from the `public/picovoice_models/` folder, or use an invalid `ACCESS_KEY` in the hook.
    - Refresh the application and try to enable the wake word toggle.
- [ ] **Error Feedback:**
    - [ ] Verify that an error toast notification (e.g., "Wake Word Error") appears, ideally with advice to check model files or AccessKey.
    - [ ] Verify that the "Enable 'Hey, ChainWhisper'" toggle switch becomes disabled or cannot be successfully enabled.
- [ ] **No Microphone Access (System Level):**
    - If possible, test behavior if microphone access is denied at the browser/system level *before* enabling the toggle. While the main STT handles this, see if Porcupine initialization shows a clear error. (This might be difficult to isolate from general mic permissions).

**F. Console Log Inspection:**

- [ ] While testing all the above scenarios, keep the browser's developer console open.
- [ ] Monitor for log messages prefixed with `[useWakeWordDetection]` (from the hook) and relevant messages from `[ChatWindow]` regarding state changes or actions.
- [ ] Note any errors or unexpected log outputs. This is particularly important for debugging initialization issues or unexpected detection failures.

---
*(New section V starts here)*

**IV. Continuous Conversation (Auto-Re-listen)**

This section tests the application's ability to automatically listen for the user's next input after the AI has finished speaking, creating a more fluid conversational flow.

**A. Successful Auto-Re-listen Cycle:**

- [ ] **Initiate Conversation:** Start a conversation either by using the "Hey, ChainWhisper" wake word (if enabled) or by manually clicking the microphone button.
- [ ] **AI Responds:** Let the AI process your query and respond with Text-to-Speech (TTS).
- [ ] **TTS Finishes:** Verify that the AI's TTS completes fully.
- [ ] **"Listening for reply..." Indicator:**
    - [ ] Observe that the "Listening for reply..." (or similar) UI indicator appears, possibly with a pulsing animation.
- [ ] **Automatic STT Activation:**
    - [ ] Verify that after a short pause (approx. 0.7 seconds), the main Speech-to-Text (STT) service activates automatically (e.g., the microphone icon in the input bar changes, indicating the app is listening for your command).
- [ ] **Speak Next Turn:** Provide your next voice input.
- [ ] **Cycle Repeats:** Verify the AI processes this new input, responds with TTS, and the system again attempts to auto-re-listen for your next turn.

**B. No User Input During Auto-Re-listen:**

- [ ] **Trigger Auto-Re-listen:** Follow steps in V.A until the main STT activates automatically.
- [ ] **Remain Silent:** Do not provide any voice input.
- [ ] **STT Timeout:** Verify that the STT session times out gracefully (browser-dependent, but typically after a few seconds of silence). The microphone icon should revert to its non-listening state.
- [ ] **No Stuck Loop:** Confirm the system does not immediately try to auto-re-listen again in a rapid loop. It should be idle or revert to wake word listening if enabled.
- [ ] **Wake Word Resumes (if enabled):** If the "Hey, ChainWhisper" toggle is active, verify that after the STT timeout, the "(Listening for wake word...)" status indicator eventually reappears.

**C. Manual STT Activation During Auto-Re-listen Transition:**

- [ ] **Trigger Auto-Re-listen Cue:** Let the AI respond, and wait for the "Listening for reply..." indicator to appear.
- [ ] **Immediate Manual STT:**
    - [ ] During the short delay *before* the main STT auto-activates, OR
    - [ ] Just as the main STT *has* auto-activated,
    - Click the main microphone button in the input bar.
- [ ] **Manual Precedence:** Verify that this manual STT activation takes precedence, works as expected, and captures your speech.
- [ ] **No Interference:** Confirm that the auto-re-listen mechanism doesn't cause duplicate STT sessions or other issues.

**D. Wake Word Interaction During Auto-Re-listen STT:**

- [ ] **Enable Wake Word:** Ensure "Hey, ChainWhisper" toggle is active.
- [ ] **Trigger Auto-Re-listen STT:** Let the AI respond, and allow the system to auto-activate the main STT (mic icon shows it's listening for your command).
- [ ] **Speak Wake Word:** While this auto-activated STT is active, say "Hey, ChainWhisper".
- [ ] **No Interference:** Verify that the system does not treat "Hey, ChainWhisper" as a *new* wake word trigger during this phase. The ongoing STT session should capture "Hey, ChainWhisper" as part of the user's command/query if spoken then. (The wake word engine should be paused when main STT is active).

**E. UI Indicator States:**

- [ ] **Indicator Timing:** Carefully observe the "Listening for reply..." indicator. Confirm it appears only after AI TTS finishes and before/during the very start of the automatic STT.
- [ ] **No Clashing Indicators:** Ensure the "Listening for reply...", "(Listening for wake word...)", and "(Wake word engine loading...)" indicators are displayed appropriately and do not confusingly overlap. The "Listening for reply..." should take precedence during its active phase.

---
*(Original Section III, now renumbered to VI and moved to the end)*

**V. General UI/UX:**
- [ ] **Button States:** Verify microphone and send buttons are appropriately enabled/disabled during STT listening, AI response loading, etc.
- [ ] **Tooltips:** Verify all relevant tooltips on buttons provide clear information.
- [ ] **Responsiveness:** Check the layout of the microphone button and input field on different screen sizes (if applicable to the changes made).
- [ ] **No Console Errors:** Open the browser's developer console and monitor for any uncaught errors during STT/TTS operations.

This checklist will help ensure the quality and correctness of the voice integration.
