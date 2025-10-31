// src/views/data.worker.js

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        console.warn("CSV data has less than 2 lines, returning empty.");
        return []; // Not enough data
    }
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
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

        if (values.length === headers.length) {
            const lat = parseFloat(values[latIndex]);
            const lng = parseFloat(values[lngIndex]);
            const avatarUrl = values[avatarIndex].replace(/"/g, ''); // Remove quotes

            if (!isNaN(lat) && !isNaN(lng)) {
                users.push({
                    seq: values[seqIndex],
                    lat,
                    lng,
                    avatarUrl: avatarUrl || null,
                });
            }
        }
    }
    return users;
}

self.onmessage = function(e) {
    const { csvPath } = e.data;

    fetch(csvPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .then(csvText => {
            const parsedUsers = parseCSV(csvText);
            // const limitedUsers = parsedUsers.slice(0, 20000);
            self.postMessage({ success: true, users: parsedUsers });
        })
        .catch(error => {
            console.error('Error in worker while fetching or parsing CSV:', error);
            self.postMessage({ success: false, error: error.message });
        });
};
