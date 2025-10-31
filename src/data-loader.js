// src/data-loader.js

let userLocationPromise = null;

export function fetchUserLocations() {
    if (userLocationPromise) {
        return userLocationPromise;
    }

    userLocationPromise = new Promise((resolve, reject) => {
        const worker = new Worker(new URL('./views/data.worker.js', import.meta.url), { type: 'module' });

        worker.onmessage = (e) => {
            if (e.data.success) {
                resolve(e.data.users);
            } else {
                console.error('Error message from worker:', e.data.error);
                reject(new Error(e.data.error));
            }
            worker.terminate();
        };

        worker.onerror = (e) => {
            console.error('Error with worker:', e);
            reject(new Error(`Worker error: ${e.message}`));
            worker.terminate();
            userLocationPromise = null; // Reset on error to allow retrying
        };

        worker.postMessage({ csvPath: '/chill-demo/user_location.csv' });
    });

    return userLocationPromise;
}
