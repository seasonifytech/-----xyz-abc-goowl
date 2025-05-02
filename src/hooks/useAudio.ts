import { useEffect, useCallback } from 'react';
import { useAudioStore } from '../store/audioStore';
import { playSound, SoundEffect } from '../services/audioService';

export function useAudio() {
  const { volume, soundEnabled, setVolume, toggleSound } = useAudioStore();
  
  // Play a sound with current volume settings
  const play = useCallback((sound: SoundEffect) => {
    playSound(sound, volume, soundEnabled);
  }, [volume, soundEnabled]);
  
  // Create a test sound on mount to handle browser autoplay policy
  useEffect(() => {
    // Try to initialize audio on component mount to handle autoplay policy
    const initAudio = () => {
      try {
        // Create and play a silent audio to get user gesture interaction
        const silentAudio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
        silentAudio.volume = 0;
        const playPromise = silentAudio.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log('Initial silent audio play failed:', error);
          });
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };
    
    initAudio();
    
    // Add event listeners to ensure audio can play after user interaction
    const enableAudioOnInteraction = () => {
      initAudio();
      // Play a test sound when user interacts with the page
      if (soundEnabled) {
        playSound('click', 0.1, true); // Play very quiet click
      }
    };
    
    document.addEventListener('click', enableAudioOnInteraction, { once: true });
    document.addEventListener('touchstart', enableAudioOnInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', enableAudioOnInteraction);
      document.removeEventListener('touchstart', enableAudioOnInteraction);
    };
  }, [soundEnabled]);
  
  return {
    volume,
    soundEnabled,
    setVolume,
    toggleSound,
    play
  };
}