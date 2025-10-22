import clickSoundSrc from './assets/click-sound.mp3';

// Create a single, reusable Audio instance to be shared across the application.
const clickAudio = new Audio(clickSoundSrc);

/**
 * Plays the click sound effect.
 * Resets the audio to the beginning before playing to handle rapid clicks.
 */
export const playClickSound = () => {
  clickAudio.currentTime = 0;
  clickAudio.play().catch(error => {
    // This can happen if the user hasn't interacted with the page yet.
    console.error("Audio playback failed:", error);
  });
};
