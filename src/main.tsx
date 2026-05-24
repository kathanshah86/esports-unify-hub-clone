import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Auto-recover from stale dynamic-import chunks after a redeploy
const RELOAD_KEY = '__chunk_reload__';
window.addEventListener('error', (e) => {
  const msg = e?.message || '';
  if (/Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk \d+ failed/i.test(msg)) {
    if (!sessionStorage.getItem(RELOAD_KEY)) {
      sessionStorage.setItem(RELOAD_KEY, '1');
      window.location.reload();
    }
  }
});
window.addEventListener('load', () => sessionStorage.removeItem(RELOAD_KEY));

createRoot(document.getElementById("root")!).render(<App />);
