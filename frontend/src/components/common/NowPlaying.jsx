import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Loader, ChevronUp, ChevronDown, Volume2 } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useSound } from '../../hooks/useSound';

const TRACKS = [
  { title: 'So What',             artist: 'Miles Davis'          },
  { title: 'Take Five',           artist: 'Dave Brubeck Quartet' },
  { title: 'Autumn Leaves',       artist: 'Bill Evans Trio'      },
  { title: 'My Favorite Things',  artist: 'John Coltrane'        },
  { title: 'Round Midnight',      artist: 'Thelonious Monk'      },
  { title: 'Blue in Green',       artist: 'Miles Davis'          },
  { title: 'Summertime',          artist: 'Ella Fitzgerald'      },
  { title: 'Fly Me to the Moon',  artist: 'Frank Sinatra'        },
  { title: 'Misty',               artist: 'Erroll Garner'        },
  { title: 'All Blues',           artist: 'Miles Davis'          },
];

/* Animated equalizer bars */
function EqBars({ playing }) {
  const heights = [3, 5, 4, 6, 3, 5];
  return (
    <div className="flex items-end gap-px flex-shrink-0" style={{ height: 14, width: 18 }}>
      {heights.map((h, i) => (
        <motion.div key={i} className="rounded-full"
          style={{ width: 2, background: 'var(--amber)', originY: 1, height: h }}
          animate={playing ? { scaleY: [0.25, 1, 0.45, 0.85, 0.35, 1, 0.55] } : { scaleY: 0.2 }}
          transition={playing
            ? { repeat: Infinity, duration: 0.75 + i * 0.13, ease: 'easeInOut', delay: i * 0.09 }
            : { duration: 0.4 }}
        />
      ))}
    </div>
  );
}

/* Spinning vinyl disc — shown in expanded player */
function VinylDisc({ playing }) {
  return (
    <motion.div
      className="relative flex-shrink-0"
      style={{ width: 48, height: 48 }}
      animate={playing ? { rotate: 360 } : { rotate: 0 }}
      transition={playing ? { repeat: Infinity, duration: 3, ease: 'linear' } : { duration: 0.5 }}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full" style={{ background: 'var(--espresso)', border: '2px solid rgba(200,145,58,0.2)' }} />
      {/* Grooves */}
      {[14, 10, 6].map((r) => (
        <div key={r} className="absolute rounded-full" style={{
          inset: r, border: '1px solid rgba(200,145,58,0.08)',
        }} />
      ))}
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: 'var(--amber)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--espresso)' }} />
        </div>
      </div>
    </motion.div>
  );
}

export default function NowPlaying({ dark = true }) {
  const { playing, loading, toggle, volume, setVolume } = useAudio();
  const { playClick, playSelect } = useSound();
  const [trackIdx, setTrackIdx] = useState(() => Math.floor(Math.random() * TRACKS.length));
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  // Fade in/out via ref on the audio element
  const fadeRef = useRef(null);

  // Rotate track every 45s when playing
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setTrackIdx((i) => (i + 1) % TRACKS.length); setVisible(true); }, 350);
    }, 45_000);
    return () => clearInterval(id);
  }, [playing]);

  // Collapse expanded player when paused
  useEffect(() => { if (!playing) setExpanded(false); }, [playing]);

  const track = TRACKS[trackIdx];
  const textColor = dark ? 'rgba(245,239,230,0.85)' : 'var(--ink-soft)';
  const subColor  = dark ? 'rgba(200,145,58,0.7)'   : 'var(--ink-muted)';
  const dotColor  = dark ? 'rgba(200,145,58,0.4)'   : 'var(--parchment3)';
  const pillStyle = dark
    ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,145,58,0.2)' }
    : { background: 'var(--parchment2)', border: '1px solid var(--parchment3)' };
  const btnBg    = dark ? 'rgba(200,145,58,0.15)' : 'var(--parchment3)';
  const btnColor = dark ? 'var(--amber)' : 'var(--ink-soft)';
  const expandBg = dark ? 'rgba(30,20,10,0.92)' : 'var(--card)';
  const expandBorder = dark ? '1px solid rgba(200,145,58,0.2)' : '1px solid var(--parchment3)';

  return (
    <div className="relative flex items-center">
      {/* ── Compact pill ──────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-full" style={pillStyle}>

        {/* Play / Pause / Loading */}
        <motion.button
          onClick={toggle}
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{ width: 22, height: 22, background: btnBg, color: btnColor }}
          whileTap={{ scale: 0.82 }}
          title={playing ? 'Pause' : 'Play jazz radio'}
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}>
              <Loader size={11} />
            </motion.div>
          ) : playing ? <Pause size={11} /> : <Play size={11} style={{ marginLeft: 1 }} />}
        </motion.button>

        {/* Eq bars */}
        <AnimatePresence>
          {playing && (
            <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 18 }} exit={{ opacity: 0, width: 0 }}>
              <EqBars playing={playing && !loading} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Track info */}
        <AnimatePresence mode="wait">
          {playing ? (
            visible && (
              <motion.div key={trackIdx} className="flex items-center gap-1.5 min-w-0"
                initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.28 }}>
                <span className="text-xs font-medium truncate max-w-24" style={{ color: textColor, fontFamily: 'DM Sans, sans-serif' }}>
                  {track.title}
                </span>
                <span style={{ color: dotColor, fontSize: 10 }}>·</span>
                <span className="text-xs truncate max-w-20" style={{ color: subColor, fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}>
                  {track.artist}
                </span>
              </motion.div>
            )
          ) : (
            <motion.span key="idle" className="text-xs"
              style={{ color: subColor, fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Jazz Radio
            </motion.span>
          )}
        </AnimatePresence>

        {/* Expand toggle — only when playing */}
        {playing && (
          <motion.button
            onClick={() => { playSelect(); setExpanded((v) => !v); }}
            className="flex-shrink-0 ml-0.5"
            style={{ color: dotColor }}
            whileTap={{ scale: 0.82 }}
            title={expanded ? 'Collapse' : 'Expand player'}
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </motion.button>
        )}
      </div>

      {/* ── Expanded mini-player ──────────────────────── */}
      <AnimatePresence>
        {expanded && playing && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 rounded-2xl p-4"
            style={{
              bottom: 'calc(100% + 10px)',
              background: expandBg,
              border: expandBorder,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              zIndex: 200,
              minWidth: 240,
            }}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            {/* Track row */}
            <div className="flex items-center gap-3 mb-4">
              <VinylDisc playing={playing && !loading} />
              <AnimatePresence mode="wait">
                {visible && (
                  <motion.div key={trackIdx} className="min-w-0"
                    initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.25 }}>
                    <p className="text-sm font-semibold truncate"
                      style={{ color: dark ? 'var(--cream)' : 'var(--ink)', fontFamily: 'DM Sans, sans-serif' }}>
                      {track.title}
                    </p>
                    <p className="text-xs font-light truncate mt-0.5"
                      style={{ color: dark ? 'rgba(200,145,58,0.7)' : 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                      {track.artist}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Volume row */}
            <div className="flex items-center gap-2.5">
              <Volume2 size={13} style={{ color: dark ? 'rgba(200,145,58,0.6)' : 'var(--ink-muted)', flexShrink: 0 }} />
              <input
                type="range" min="0" max="1" step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1"
                style={{ accentColor: 'var(--amber)', height: 3, cursor: 'pointer' }}
              />
              <span className="text-xs flex-shrink-0"
                style={{ color: dark ? 'rgba(245,239,230,0.4)' : 'var(--ink-muted)', fontFamily: 'DM Mono, monospace', fontSize: 10, minWidth: 26, textAlign: 'right' }}>
                {Math.round(volume * 100)}
              </span>
            </div>

            {/* Live badge */}
            <div className="flex items-center gap-1.5 mt-3">
              <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--rose)' }}
                animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} />
              <span className="text-xs" style={{ color: dark ? 'rgba(245,239,230,0.4)' : 'var(--ink-muted)', fontFamily: 'DM Sans, sans-serif', fontWeight: 300 }}>
                Live Jazz Radio
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
