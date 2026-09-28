import { createContext, useContext, useCallback, useRef, useState } from 'react';

const SpeakContext = createContext(null);

const DEFAULT_NARRATION =
  'Kabadi Connect mein aapka swagat hai. Purana kabad becho aur sahi bhaav pao. Neeche diye gaye buttons ko dabakar aage badhein.';

function splitSentences(text) {
  const pieces = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!pieces) return [];
  const out = [];
  let start = 0;
  for (let i = 0; i < pieces.length; i++) {
    const ch = pieces[i];
    if (ch === '.' || ch === '?' || ch === '!' || ch === '।') {
      out.push(pieces.slice(start, i + 1));
      start = i + 1;
    } else if (ch === ',' && i - start > 120) {
      out.push(pieces.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (start < pieces.length) out.push(pieces.slice(start));
  return out.map((s) => s.trim()).filter(Boolean);
}

export function SpeakProvider({ children }) {
  const [playing, setPlaying] = useState(false);
  const [narration, setNarration] = useState(DEFAULT_NARRATION);
  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const speakingRef = useRef(false);

  const stop = useCallback(() => {
    speakingRef.current = false;
    queueRef.current = [];
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current = null;
      } catch {
        /* ignore */
      }
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, []);

  const sayFallback = useCallback(
    (text) => {
      if (!('speechSynthesis' in window)) return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'hi-IN';
      utter.rate = 1;
      utter.onstart = () => setPlaying(true);
      utter.onend = () => {
        speakingRef.current = false;
        setPlaying(false);
      };
      utter.onerror = () => {
        speakingRef.current = false;
        setPlaying(false);
      };
      window.speechSynthesis.speak(utter);
    },
    [],
  );

  const playExternal = useCallback(
    (text) =>
      new Promise((resolve) => {
        // Direct to Google Translate TTS: <audio> doesn't need CORS and the
        // <meta name="referrer" content="no-referrer"> keeps the request accepted.
        const url =
          `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=hi&q=${encodeURIComponent(text)}`;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          if (audioRef.current === audio) audioRef.current = null;
          resolve(true);
        };
        audio.onerror = () => {
          if (audioRef.current === audio) audioRef.current = null;
          resolve(false);
        };
        audio.play().catch(() => resolve(false));
      }),
    [],
  );

  const speak = useCallback(
    async (text) => {
      stop();
      const chunks = splitSentences(text);
      if (!chunks.length) return;
      speakingRef.current = true;
      setPlaying(true);
      queueRef.current = [...chunks];
      for (const chunk of queueRef.current) {
        if (!speakingRef.current) break;
        const ok = await playExternal(chunk);
        if (!ok) {
          speakingRef.current = false;
          sayFallback(text);
          return;
        }
      }
      if (speakingRef.current) {
        speakingRef.current = false;
        setPlaying(false);
      }
    },
    [stop, playExternal, sayFallback],
  );

  const toggle = useCallback(() => {
    if (speakingRef.current) {
      stop();
    } else {
      speak(narration || DEFAULT_NARRATION);
    }
  }, [speak, stop, narration]);

  return (
    <SpeakContext.Provider
      value={{ speak, stop, toggle, playing, narration, setNarration }}
    >
      {children}
    </SpeakContext.Provider>
  );
}

export function useSpeak() {
  return useContext(SpeakContext);
}