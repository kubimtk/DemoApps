// Config helper that works in both Vite and Jest environments
function getApiUrl(): string {
  // In test environment (Node.js), use process.env
  if (typeof process !== 'undefined' && process.env.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }
  
  // In Vite environment, try to access import.meta.env dynamically
  // This is wrapped to avoid parse errors in Jest
  try {
    const importMetaEnv = new Function('return import.meta.env')();
    if (importMetaEnv?.VITE_API_URL) {
      return importMetaEnv.VITE_API_URL;
    }
  } catch (e) {
    // import.meta not available (Jest environment)
  }
  
  // Default fallback
  return 'http://localhost:3000/api';
}

export const API_URL = getApiUrl();

