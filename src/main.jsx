import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import LoadingScreen from './components/LoadingScreen.jsx';

// Lazily load both major components, ensuring the GlobeView has a minimum load time.
const GlobeView = lazy(() => {
    const globePromise = import('./views/GlobeView.jsx');
    const minDelayPromise = new Promise(resolve => setTimeout(resolve, 2000));
    // Wait for both the component to load and the minimum delay to pass.
    return Promise.all([globePromise, minDelayPromise]).then(([module]) => module);
});
const App = lazy(() => import('./App.jsx'));

// Create a single element instance to share across both map routes
const appElement = <App />;

// Create a browser router with route configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <GlobeView />,
  },
  {
    path: '/map',
    element: appElement,
  },
  {
    path: '/map/:lat/:lng',
    element: appElement,
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