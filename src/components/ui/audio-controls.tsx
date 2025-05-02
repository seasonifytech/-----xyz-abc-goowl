import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './button';
import { useAudio } from '../../hooks/useAudio';
import { playSound } from '../../services/audioService';

export const AudioControls: React.FC = () => {
  const { volume, soundEnabled, setVolume, toggleSound } = useAudio();
  
  const handleToggleSound = () => {
    // Play the click sound if we're enabling sound
    if (!soundEnabled) {
      // We need to play the sound directly here because the store hasn't updated yet
      playSound('click', volume, true);
    }
    toggleSound();
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // Play a sample sound to demonstrate the new volume
    playSound('click', newVolume, soundEnabled);
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggleSound}
        className="focus:outline-none"
        aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
      >
        {soundEnabled ? <Volume2 className="h-5 w-5 text-[#8b3dff]" /> : <VolumeX className="h-5 w-5 text-gray-400" />}
      </Button>
      
      {soundEnabled && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-2 accent-[#8b3dff]"
          aria-label="Volume control"
        />
      )}
    </div>
  );
};