const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'yashos_auth_token_v1';
export const getToken = () => localStorage.getItem(TOKEN_KEY);

async function request(path, options = {}) {
  const token = getToken();
  if (!token) return null;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export function apiSync(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
}

export function pullSync() {
  return request('/sync');
}
