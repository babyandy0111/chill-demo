// src/data-loader.js

// This is a simple CSV parser. For very large or complex CSVs,
// a more robust library might be considered, but this avoids adding new dependencies.
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        console.warn("CSV data has less than 2 lines, returning empty.");
        return []; // Not enough data
    }
    // Parse headers safely, removing quotes
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const users = [];

    const latIndex = headers.indexOf('location_lat');
    const lngIndex = headers.indexOf('location_lng');
    const avatarIndex = headers.indexOf('avatar_url');
    const seqIndex = headers.indexOf('seq');

    if (latIndex === -1 || lngIndex === -1 || avatarIndex === -1) {
        console.error("CSV headers are missing required columns (location_lat, location_lng, avatar_url)");
        return [];
    }

    for (let i = 1; i < lines.length; i++) {
        // This regex handles quoted fields that may contain commas
        const values = lines[i].split(/,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/);

        if (values.length === headers.length) {
            const lat = parseFloat(values[latIndex]);
            const lng = parseFloat(values[lngIndex]);
            const avatarUrl = values[avatarIndex].replace(/"/g, ''); // Remove quotes

            // Ensure latitude and longitude are valid numbers
            if (!isNaN(lat) && !isNaN(lng)) {
                users.push({
                    seq: values[seqIndex],
                    lat,
                    lng,
                    avatarUrl: avatarUrl || null, // Use null if avatar is empty
                });
            }
        }
    }
    return users;
}


let userLocationPromise = null;

/**
 * Fetches and parses user location data from the CSV file.
 * It caches the promise to avoid re-fetching the data on subsequent calls.
 * @returns {Promise<Array<{seq: string, lat: number, lng: number, avatarUrl: string | null}>>}
 */
export function fetchUserLocations() {
    if (userLocationPromise) {
        return userLocationPromise;
    }

    userLocationPromise = fetch('/chill-demo/user_location.csv') // Vite serves files from the 'public' directory at the root
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .then(csvText => {
            const parsedUsers = parseCSV(csvText);
            const limitedUsers = parsedUsers.slice(0, 100);
            return limitedUsers;
        })
        .catch(error => {
            console.error('Error loading or parsing user locations:', error);
            userLocationPromise = null; // Reset on error to allow retrying
            return []; // Return an empty array on failure to prevent crashes
        });

    return userLocationPromise;
}
