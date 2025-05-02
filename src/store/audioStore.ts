import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AudioState {
  volume: number;
  soundEnabled: boolean;
  
  // Actions
  setVolume: (volume: number) => void;
  toggleSound: () => void;
  enableSound: () => void;
  disableSound: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      // Default state
      volume: 0.5, // 50% volume
      soundEnabled: true,
      
      // Actions
      setVolume: (volume: number) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      enableSound: () => set({ soundEnabled: true }),
      disableSound: () => set({ soundEnabled: false }),
    }),
    {
      name: 'audio-settings', // localStorage key
      onRehydrateStorage: () => {
        return (state) => {
          console.log('Audio settings rehydrated:', state?.soundEnabled ? 'enabled' : 'disabled');
        };
      },
    }
  )
);