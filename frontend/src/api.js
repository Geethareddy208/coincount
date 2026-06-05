// In development, VITE_API_URL is empty so requests go through the Vite proxy to localhost:5000
// In production (Vercel), VITE_API_URL is set to the Render backend URL
const BASE_URL = import.meta.env.VITE_API_URL || '';

export function apiFetch(path, options = {}) {
  return fetch(`${BASE_URL}${path}`, options);
}
