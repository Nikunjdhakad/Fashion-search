import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from "./App.jsx";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import { AppProvider } from "./context/AppContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="desifit-ui-theme">
      <AppProvider>
        <App />
      </AppProvider>
    </ThemeProvider>
  </StrictMode>
);