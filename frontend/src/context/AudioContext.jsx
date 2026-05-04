import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';

/**
 * AudioContext (Jazz Radio)
 * ─────────────────────────────────────────────────────────────
 * Streams live jazz internet radio in the background.
 * Three public stream URLs are tried in order — if one fails,
 * the next is loaded automatically.
 *
 * WHY a context?
 *   The audio player needs to persist across page navigation.
 *   If it lived inside a single component (e.g. NowPlaying), it would
 *   stop playing every time the user navigated to a different page.
 *   By living at the app root as a context, the HTMLAudioElement is
 *   created once and never destroyed during the session.
 *
 * WHY useRef for the audio element?
 *   The HTMLAudioElement is a mutable object that we interact with
 *   imperatively (play, pause, set volume). It doesn't need to trigger
 *   re-renders when it changes — that's exactly what useRef is for.
 *   useState would cause unnecessary re-renders every time we touched
 *   the audio element.
 *
 * WHY useCallback for toggle and setVolume?
 *   These functions are passed down via context to child components.
 *   Without useCallback, a new function reference would be created on
 *   every render, causing any component that uses them as useEffect
 *   dependencies to re-run unnecessarily.
 *
 * Features:
 *   - Fade in on play  (volume ramps 0 → target over ~1s)
 *   - Fade out on pause (volume ramps down → 0, then stream released)
 *   - Volume control (0–1)
 *   - Loading state while buffering
 *   - Persists across page navigation (context lives at app root)
 *
 * ─────────────────────────────────────────────────────────────
 * HOOK: useAudio()
 * ─────────────────────────────────────────────────────────────
 * WHY it exists:
 *   Gives any component access to the audio player state and controls
 *   without needing to import the context object directly.
 *
 * WHAT it returns:
 *   playing   — boolean, true if audio is currently playing
 *   loading   — boolean, true if stream is buffering
 *   toggle()  — start playback (with fade in) or stop (with fade out)
 *   volume    — current volume as a 0–1 number
 *   setVolume(v) — update volume (updates both state and audio element)
 *   stream    — { url, name, genre } of the current stream
 *
 * WHERE it's used:
 *   NowPlaying.jsx — the jazz radio widget in the menu header and splash
 *
 * EXAMPLE:
 *   const { playing, toggle, volume, setVolume } = useAudio();
 *   <button onClick={toggle}>{playing ? 'Pause' : 'Play'}</button>
 */

// Public jazz radio streams — no API key required
const STREAMS = [
  { url: 'https://streaming.radio.co/s3f2987bce/listen', name: 'Jazz FM',    genre: 'Smooth Jazz'  },
  { url: 'https://jazz-wr04.ice.infomaniak.ch/jazz-wr04-128.mp3', name: 'Jazz Radio', genre: 'Classic Jazz' },
  { url: 'https://stream.0nlineradio.com/jazz?ref=radiobrowser',  name: '0nline Jazz', genre: 'Jazz & Blues' },
];

const AudioCtx = createContext(null);

export function AudioProvider({ children }) {
  // Ref to the underlying HTMLAudioElement — created once on mount
  const audioRef = useRef(null);

  const [playing,      setPlaying]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [streamIdx,    setStreamIdx]    = useState(0);      // which stream we're on
  const [volume,       setVolumeState]  = useState(0.45);   // default 45% — ambient level

  // Create the Audio element once and wire up all event listeners
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none'; // don't load anything until the user presses play
    audio.volume  = 0.45;
    audioRef.current = audio;

    // Mirror native audio events into React state
    const onPlay    = () => { setPlaying(true);  setLoading(false); };
    const onPause   = () => setPlaying(false);
    const onWaiting = () => setLoading(true);   // buffering
    const onCanPlay = () => setLoading(false);  // buffer ready
    const onError   = () => setStreamIdx((i) => (i + 1) % STREAMS.length); // try next stream

    audio.addEventListener('play',    onPlay);
    audio.addEventListener('pause',   onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error',   onError);

    // Cleanup on unmount — stop audio and remove listeners
    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('play',    onPlay);
      audio.removeEventListener('pause',   onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error',   onError);
    };
  }, []);

  // If the stream index changes while playing, reload with the new URL
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playing) return;
    audio.src = STREAMS[streamIdx].url;
    audio.load();
    audio.play().catch(() => {});
  }, [streamIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * toggle — start or stop playback with a smooth fade.
   * Fade in: volume ramps from 0 to target over ~1s
   * Fade out: volume ramps to 0, then stream is released
   */
  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      // Fade out: decrease volume by 0.06 every 40ms until near zero
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.06);
        } else {
          clearInterval(fadeOut);
          audio.pause();
          audio.src = '';       // release the stream connection
          audio.volume = volume; // restore volume for next play
        }
      }, 40);
    } else {
      // Fade in: start at 0, ramp up to target volume
      setLoading(true);
      audio.volume = 0;
      audio.src = STREAMS[streamIdx].url;
      audio.load();
      audio.play().then(() => {
        const fadeIn = setInterval(() => {
          if (audio.volume < volume - 0.05) {
            audio.volume = Math.min(volume, audio.volume + 0.04);
          } else {
            audio.volume = volume;
            clearInterval(fadeIn);
          }
        }, 40);
      }).catch(() => setLoading(false));
    }
  }, [playing, streamIdx, volume]);

  /** setVolume — update both React state and the live audio element */
  const setVolume = useCallback((v) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  return (
    <AudioCtx.Provider value={{ playing, loading, toggle, volume, setVolume, stream: STREAMS[streamIdx] }}>
      {children}
    </AudioCtx.Provider>
  );
}

/**
 * useAudio
 * ─────────────────────────────────────────────────────────────
 * Custom hook to consume the AudioContext.
 *
 * WHY a custom hook?
 *   Same reasons as useCart and useToast — cleaner imports, built-in
 *   error guard, and a single place to update if the API changes.
 *
 * IMPORTANT: The audio element is created imperatively (not via JSX)
 * because HTMLAudioElement needs to persist for the entire app session.
 * React would destroy and recreate a JSX <audio> element on navigation.
 *
 * RULE: Must be used inside a component that is a descendant of
 * <AudioProvider>. AudioProvider wraps the whole app in App.jsx.
 */
export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be inside AudioProvider');
  return ctx;
};
