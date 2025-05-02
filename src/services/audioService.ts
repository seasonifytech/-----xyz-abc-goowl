// Audio playback service with built-in fallbacks and error handling

// Audio types
export type SoundEffect = 'click' | 'correct' | 'incorrect' | 'lessonComplete' | 'levelComplete' | 'typing';

// Map sound types to file paths
const soundMap: Record<SoundEffect, string> = {
  click: '/sound-effects/Voicy_Click.mp3',
  correct: '/sound-effects/Voicy_Correct answer sound effect .mp3', // Note the space before .mp3
  incorrect: '/sound-effects/Voicy_Bad answer.mp3',
  lessonComplete: '/sound-effects/Voicy_Lesson complete.mp3',
  levelComplete: '/sound-effects/Voicy_Level complete .mp3', // Note the space before .mp3
  typing: '/sound-effects/mixkit-single-key-type-2533.wav'
};

// Base64 encoded silent WAV file (1ms) for fallbacks
const SILENT_AUDIO_BASE64 = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

// Audio cache - stores AudioContext and actual audio elements
interface AudioCacheItem {
  element: HTMLAudioElement;
  context?: AudioContext;
  source?: AudioBufferSourceNode;
  buffer?: AudioBuffer;
  isLoaded: boolean;
  isFallback: boolean;
}

// Initialize cache
const audioCache: Record<SoundEffect, AudioCacheItem> = {
  click: { element: new Audio(), isLoaded: false, isFallback: true },
  correct: { element: new Audio(), isLoaded: false, isFallback: true },
  incorrect: { element: new Audio(), isLoaded: false, isFallback: true },
  lessonComplete: { element: new Audio(), isLoaded: false, isFallback: true },
  levelComplete: { element: new Audio(), isLoaded: false, isFallback: true },
  typing: { element: new Audio(), isLoaded: false, isFallback: true }
};

// Track currently playing sounds
const playingSounds: Set<SoundEffect> = new Set();

// Create an audio context if Web Audio API is available
let audioContext: AudioContext | null = null;
try {
  // Using a lazy-initialized pattern to avoid autoplay policy issues
  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  console.log('AudioContext created successfully');
} catch (error) {
  console.warn('Web Audio API not supported:', error);
}

// Create a silent fallback audio element
const createSilentAudio = (): HTMLAudioElement => {
  const audio = new Audio(SILENT_AUDIO_BASE64);
  audio.volume = 0;
  return audio;
};

// Preload all audio files
export const preloadAudio = (): void => {
  console.log('Preloading audio files...');

  // Need to unlock audio on first user interaction
  const unlockAudio = () => {
    // Create and play a silent audio
    const silentAudio = createSilentAudio();
    const playPromise = silentAudio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Audio context unlocked');
          document.removeEventListener('click', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
        })
        .catch(err => {
          console.warn('Failed to unlock audio context:', err);
        });
    }
  };

  // Add event listeners to unlock audio on user interaction
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });

  // Load each sound
  Object.entries(soundMap).forEach(([sound, path]) => {
    const soundEffect = sound as SoundEffect;
    loadSound(soundEffect, path);
  });
};

// Load a single sound
const loadSound = (sound: SoundEffect, path: string): void => {
  console.log(`Loading sound: ${sound} from ${path}`);
  
  // Create a new audio element
  const audio = new Audio();
  
  // Set up event listeners
  audio.addEventListener('canplaythrough', () => {
    console.log(`Sound loaded successfully: ${sound}`);
    audioCache[sound] = {
      element: audio,
      isLoaded: true,
      isFallback: false
    };
  }, { once: true });
  
  audio.addEventListener('error', (e) => {
    console.warn(`Error loading sound ${sound} from ${path}:`, e);
    // Replace with silent fallback
    audioCache[sound] = {
      element: createSilentAudio(),
      isLoaded: true, 
      isFallback: true
    };
  });
  
  // Start loading
  audio.src = path;
  audio.load();
  
  // Set initial cache entry with silent fallback until real audio loads
  audioCache[sound] = {
    element: createSilentAudio(),
    isLoaded: false,
    isFallback: true
  };
  
  // Attempt to load with Web Audio API for more control if available
  if (audioContext) {
    loadSoundWithWebAudio(sound, path);
  }
};

// Load a sound with Web Audio API for more reliable playback
const loadSoundWithWebAudio = async (sound: SoundEffect, path: string): Promise<void> => {
  try {
    if (!audioContext) return;
    
    console.log(`Loading sound with Web Audio API: ${sound}`);
    
    // Fetch the audio file
    const response = await fetch(path);
    if (!response.ok) {
      console.warn(`Failed to fetch audio file ${path}: ${response.status} ${response.statusText}`);
      return;
    }
    
    // Convert to array buffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    console.log(`Sound loaded with Web Audio API: ${sound}`);
    
    // Update cache with Web Audio data
    audioCache[sound] = {
      ...audioCache[sound],
      context: audioContext,
      buffer: audioBuffer,
      isLoaded: true,
      isFallback: false
    };
  } catch (error) {
    console.warn(`Error loading sound with Web Audio API: ${sound}`, error);
  }
};

// Play a sound effect with volume control
export const playSound = (
  sound: SoundEffect,
  volume: number = 0.5,
  enabled: boolean = true
): void => {
  // Skip if sound is disabled
  if (!enabled) {
    console.log(`Sound disabled, skipping: ${sound}`);
    return;
  }

  // Clamp volume between 0-1
  const safeVolume = Math.max(0, Math.min(1, volume));
  
  console.log(`Attempting to play sound: ${sound} (volume: ${safeVolume.toFixed(2)})`);
  
  try {
    // If not yet in cache or still loading, use a silent fallback
    if (!audioCache[sound] || (!audioCache[sound].isLoaded && audioCache[sound].isFallback)) {
      console.log(`Sound ${sound} not ready, using fallback and loading for next time`);
      
      // For improved user experience, still attempt to load the real sound for next time
      if (!audioCache[sound]?.isLoaded) {
        loadSound(sound, soundMap[sound]);
      }
      
      // Play silent audio to avoid errors
      const silentAudio = createSilentAudio();
      silentAudio.volume = 0;
      silentAudio.play().catch(e => console.log('Silent audio error:', e));
      return;
    }
    
    // For typing sound, we don't need to prevent stacking as it should play rapidly
    // For other sounds, prevent sound stacking (don't play the same sound multiple times simultaneously)
    if (sound !== 'typing' && playingSounds.has(sound)) {
      console.log(`Sound already playing, skipping: ${sound}`);
      return;
    }
    
    playingSounds.add(sound);
    
    // Try to play with Web Audio API first (more reliable)
    if (audioCache[sound].context && audioCache[sound].buffer) {
      playWithWebAudio(sound, safeVolume).catch(error => {
        console.warn(`Web Audio playback failed for ${sound}:`, error);
        // Fall back to HTML5 Audio
        playWithHtmlAudio(sound, safeVolume);
      });
    } else {
      // Fall back to HTML5 Audio
      playWithHtmlAudio(sound, safeVolume);
    }
  } catch (error) {
    console.error(`Exception playing sound: ${sound}`, error);
    playingSounds.delete(sound);
  }
};

// Play using Web Audio API
const playWithWebAudio = async (sound: SoundEffect, volume: number): Promise<void> => {
  const cache = audioCache[sound];
  
  if (!cache.context || !cache.buffer) {
    throw new Error('Web Audio API context or buffer not available');
  }
  
  try {
    // Resume context if suspended (autoplay policy)
    if (cache.context.state === 'suspended') {
      await cache.context.resume();
    }
    
    // Create source node
    const source = cache.context.createBufferSource();
    source.buffer = cache.buffer;
    
    // Create gain node for volume control
    const gainNode = cache.context.createGain();
    gainNode.gain.value = volume;
    
    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(cache.context.destination);
    
    // Save source to cache for potential stopping
    cache.source = source;
    
    // Set up completion handler
    source.onended = () => {
      playingSounds.delete(sound);
    };
    
    // Start playback
    source.start(0);
    console.log(`Playing ${sound} with Web Audio API (volume: ${volume})`);
  } catch (error) {
    playingSounds.delete(sound);
    throw error;
  }
};

// Play using HTML5 Audio
const playWithHtmlAudio = (sound: SoundEffect, volume: number): void => {
  const cache = audioCache[sound];
  
  try {
    // Clone the audio element to avoid conflicts with multiple plays
    const audioToPlay = cache.element.cloneNode(true) as HTMLAudioElement;
    audioToPlay.volume = volume;
    
    // For typing sound, reduce duration to make it snappier
    if (sound === 'typing') {
      audioToPlay.currentTime = 0.05; // Start slightly into the sound
    }
    
    // Set up event handlers
    audioToPlay.onended = () => {
      playingSounds.delete(sound);
    };
    
    audioToPlay.onerror = (error) => {
      console.error(`HTML5 Audio error for ${sound}:`, error);
      playingSounds.delete(sound);
    };
    
    // Play the sound
    const playPromise = audioToPlay.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error(`HTML5 Audio play failed for ${sound}:`, error);
        playingSounds.delete(sound);
        
        // If playback failed, try to create a silent fallback
        audioCache[sound] = {
          element: createSilentAudio(),
          isLoaded: true,
          isFallback: true
        };
      });
    }
    
    console.log(`Playing ${sound} with HTML5 Audio (volume: ${volume})`);
  } catch (error) {
    playingSounds.delete(sound);
    throw error;
  }
};

// Create base64 encoded silent audio files to use when real audio files are missing
export const createFallbackAudios = (): void => {
  Object.keys(soundMap).forEach((sound) => {
    const silentAudio = createSilentAudio();
    audioCache[sound as SoundEffect] = {
      element: silentAudio,
      isLoaded: true,
      isFallback: true
    };
  });
  console.log('Created fallback audio for all sounds');
};

// Add a window-level debug function to test audio
(window as any).testAudio = (sound: SoundEffect = 'click', volume: number = 0.5): void => {
  console.log(`Manual test of sound: ${sound}`);
  playSound(sound, volume, true);
};