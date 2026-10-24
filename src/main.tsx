import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register service worker immediately for full offline caching
registerSW({
  immediate: true,
  onOfflineReady() {
    console.info('The Green Medic is cached and ready for 100% offline use.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
