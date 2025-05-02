// This file creates fallback base64 audio files
// These silent 1ms WAV files will be used when the real audio files are missing

const silentBase64 = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

const createFallbackAudio = (soundName) => {
  const audio = new Audio();
  audio.src = `data:audio/wav;base64,${silentBase64}`;
  return audio;
};

// Create fallbacks for all sounds
const fallbacks = {
  click: createFallbackAudio('click'),
  correct: createFallbackAudio('correct'),
  incorrect: createFallbackAudio('incorrect'),
  lessonComplete: createFallbackAudio('lessonComplete'),
  levelComplete: createFallbackAudio('levelComplete')
};

// Export the fallbacks
export default fallbacks;