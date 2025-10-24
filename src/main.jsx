import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import LoadingScreen from './LoadingScreen.jsx';

// Lazily load both major components, ensuring the GlobeView has a minimum load time.
const GlobeView = lazy(() => {
    const globePromise = import('./GlobeView.jsx');
    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2000));
    // Wait for both the component to load and the minimum delay to pass.
    return Promise.all([globePromise, minDelayPromise]).then(([module]) => module);
});
const App = lazy(() => import('./App.jsx'));

// Create a browser router with route configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <GlobeView />,
  },
  {
    path: '/map', // Add route for /map without params
    element: <App />,
  },
  {
    path: '/map/:lat/:lng',
    element: <App />,
  },
], {
  basename: "/chill-demo", // Set the basename for GitHub Pages
});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Suspense fallback={<LoadingScreen />}>
            <RouterProvider router={router} />
        </Suspense>
    </StrictMode>,
);