const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getConversations: (status?: string) =>
    apiFetch(`/conversations/${status ? `?status=${status}` : ''}`),

  getConversation: (id: string) =>
    apiFetch(`/conversations/${id}`),

  updateStatus: (id: string, status: string) =>
    apiFetch(`/conversations/${id}/status?status=${status}`, { method: 'PATCH' }),

  getClients: () =>
    apiFetch('/clients/'),

  chat: (payload: object) =>
    apiFetch('/agent/chat', { method: 'POST', body: JSON.stringify(payload) }),
};
