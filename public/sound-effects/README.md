# Sound Effects

This directory contains audio files for UI interactions in the application.

## Files to Upload
The application expects the following audio files to be present in this directory:

- `Voicy_Bad answer.mp3` - Played when an incorrect answer is given
- `Voicy_Click.mp3` - Played when buttons are clicked
- `Voicy_Correct answer sound effect .mp3` - Played when a correct answer is given
- `Voicy_Lesson complete.mp3` - Played when a lesson is completed
- `Voicy_Level complete .mp3` - Played when a level is completed
- `mixkit-single-key-type-2533.wav` - Played when typing in input fields

## If You Don't Have These Files

If you don't have these specific audio files, the application will use silent audio files as fallbacks.

You can replace them with your own audio files by uploading MP3 files with the exact filenames listed above.

## Testing Sound

Once running, you can test sounds in the browser console with:

```javascript
window.testAudio('click', 0.5);  // Test click sound at 50% volume
window.testAudio('correct', 0.7); // Test correct sound at 70% volume
window.testAudio('incorrect', 0.7); // Test incorrect sound
window.testAudio('lessonComplete', 0.7); // Test lesson complete sound
window.testAudio('levelComplete', 0.7); // Test level complete sound
window.testAudio('typing', 0.3); // Test typing sound at 30% volume (quieter)
```