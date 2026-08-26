import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { TrackInfo, AUDIO_BASE } from '../data';

interface AudioContextType {
  currentTrack: TrackInfo | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playTrack: (track: TrackInfo) => void;
  playQueue: (tracks: TrackInfo[], index: number) => void;
  togglePlay: () => void;
  setVolume: (val: number) => void;
  seek: (pct: number) => void;
}

function encodePath(path: string): string {
  return path.split('/').map(segment =>
    encodeURIComponent(segment)
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/'/g, '%27')
  ).join('/');
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<TrackInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const queueRef = useRef<TrackInfo[]>([]);
  const currentIndexRef = useRef<number>(-1);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      const nextIndex = currentIndexRef.current + 1;
      if (nextIndex < queueRef.current.length) {
        const nextTrack = queueRef.current[nextIndex];
        currentIndexRef.current = nextIndex;
        setCurrentTrack(nextTrack);
        audio.src = import.meta.env.BASE_URL + AUDIO_BASE + encodePath(nextTrack.path);
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playQueue = (tracks: TrackInfo[], index: number) => {
    if (!audioRef.current || index < 0 || index >= tracks.length) return;
    const track = tracks[index];

    if (currentTrack?.path === track.path) {
      togglePlay();
      return;
    }

    queueRef.current = tracks;
    currentIndexRef.current = index;
    setCurrentTrack(track);
    audioRef.current.src = import.meta.env.BASE_URL + AUDIO_BASE + encodePath(track.path);
    audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
      console.error('Audio play error:', err);
      setIsPlaying(false);
    });
  };

  const playTrack = (track: TrackInfo) => {
    if (!audioRef.current) return;

    if (currentTrack?.path === track.path) {
      togglePlay();
      return;
    }

    queueRef.current = [track];
    currentIndexRef.current = 0;
    setCurrentTrack(track);

    try {
      const fullPath = import.meta.env.BASE_URL + AUDIO_BASE + encodePath(track.path);
      audioRef.current.src = fullPath;
      
      audioRef.current.load(); 

      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Audio play error:', err);
          setIsPlaying(false);
        });
    } catch (error) {
      console.error('Path resolution error:', error);
    }
  };


  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
        console.error('Audio play error:', err);
        setIsPlaying(false);
      });
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  const seek = (pct: number) => {
    if (!audioRef.current) return;
    const newTime = pct * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  return (
    <AudioContext.Provider value={{
      currentTrack, isPlaying, progress, duration, volume,
      playTrack, playQueue, togglePlay, setVolume, seek,
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
