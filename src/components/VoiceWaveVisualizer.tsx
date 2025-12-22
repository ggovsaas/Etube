'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface VoiceWaveVisualizerProps {
  audioUrl: string | null | undefined;
  variant?: 'thumbnail' | 'full';
  className?: string;
}

export default function VoiceWaveVisualizer({ 
  audioUrl, 
  variant = 'thumbnail',
  className = '' 
}: VoiceWaveVisualizerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !audioUrl || !waveformRef.current || variant === 'thumbnail') {
      return;
    }

    // Only create interactive waveform for full variant
    if (variant === 'full') {
      setIsLoading(true);
      
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#ef4444',
        progressColor: '#dc2626',
        cursorColor: '#991b1b',
        barWidth: 2,
        barRadius: 3,
        responsive: true,
        height: 60,
        normalize: true,
        backend: 'WebAudio',
      });

      wavesurfer.load(audioUrl);

      wavesurfer.on('ready', () => {
        setIsLoading(false);
      });

      wavesurfer.on('play', () => {
        setIsPlaying(true);
      });

      wavesurfer.on('pause', () => {
        setIsPlaying(false);
      });

      wavesurfer.on('finish', () => {
        setIsPlaying(false);
      });

      wavesurferRef.current = wavesurfer;

      return () => {
        wavesurfer.destroy();
      };
    }
  }, [audioUrl, variant, mounted]);

  const togglePlayback = () => {
    if (wavesurferRef.current && variant === 'full') {
      wavesurferRef.current.playPause();
    }
  };

  // Debug: Log when component renders
  useEffect(() => {
    if (audioUrl) {
      console.log('VoiceWaveVisualizer rendering with audioUrl:', audioUrl, 'variant:', variant);
    }
  }, [audioUrl, variant]);

  if (!audioUrl) {
    return null;
  }

  if (variant === 'thumbnail') {
    // Static visualization for thumbnail - just show icon
    return (
      <div className={`${className} absolute bottom-3 left-3 bg-black bg-opacity-60 backdrop-blur-sm text-white p-2 rounded-full flex items-center justify-center z-20`}>
        <i className="fas fa-microphone text-sm"></i>
      </div>
    );
  }

  // Full interactive version
  return (
    <div className={`${className} space-y-2`}>
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlayback}
          disabled={isLoading}
          className="flex-shrink-0 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition disabled:opacity-50"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : isPlaying ? (
            <i className="fas fa-pause"></i>
          ) : (
            <i className="fas fa-play"></i>
          )}
        </button>
        <div ref={waveformRef} className="flex-1 min-h-[60px]" />
      </div>
    </div>
  );
}

