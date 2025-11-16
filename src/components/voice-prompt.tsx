"use client";

import { useEffect } from "react";

interface VoicePromptProps {
  text: string;
  lang?: string;
}

export function VoicePrompt({ text, lang = "id-ID" }: VoicePromptProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && text) {
      // Cancel any previous speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      // A small delay to ensure previous speech is cancelled and new one starts
      const startSpeech = () => {
        if(window.speechSynthesis.speaking) {
          setTimeout(startSpeech, 100);
        } else {
          window.speechSynthesis.speak(utterance);
        }
      };
      startSpeech();
    }
  }, [text, lang]);

  return null;
}
