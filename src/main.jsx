import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

// Lazily load both major components
const GlobeView = lazy(() => import('./GlobeView.jsx'));
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
        <Suspense fallback={<div>地圖載入中...</div>}>
            <RouterProvider router={router} />
        </Suspense>
    </StrictMode>,
);