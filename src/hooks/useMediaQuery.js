import { useState, useEffect } from 'react';

/**
 * A custom React hook that tracks whether a media query is met.
 * @param {string} query - The CSS media query string to watch.
 * @returns {boolean} - True if the media query is currently met, false otherwise.
 */
export function useMediaQuery(query) {
  // Get the initial value on the client-side
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    const listener = (event) => {
      setMatches(event.matches);
    };

    // Add the listener
    mediaQueryList.addEventListener('change', listener);

    // Clean up the listener on component unmount
    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query]); // Re-run effect if query changes

  return matches;
}
