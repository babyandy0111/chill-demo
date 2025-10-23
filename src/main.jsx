import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import GlobeView from "./GlobeView.jsx";
import App from "./App.jsx"; // Import the App component

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
        ]);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router}/>
    </StrictMode>,
);