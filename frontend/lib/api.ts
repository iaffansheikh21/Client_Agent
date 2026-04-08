// const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// export async function apiFetch(path: string, options?: RequestInit) {
//   const res = await fetch(`${BASE}${path}`, {
//     headers: { 'Content-Type': 'application/json' },
//     ...options,
//   });
//   if (!res.ok) throw new Error(`API error: ${res.status}`);
//   return res.json();
// }

// export const api = {
//   getConversations: (status?: string) =>
//     apiFetch(`/conversations/${status ? `?status=${status}` : ''}`),

//   getConversation: (id: string) =>
//     apiFetch(`/conversations/${id}`),

//   updateStatus: (id: string, status: string) =>
//     apiFetch(`/conversations/${id}/status?status=${status}`, { method: 'PATCH' }),

//   getClients: () =>
//     apiFetch('/clients/'),

//   chat: (payload: object) =>
//     apiFetch('/agent/chat', { method: 'POST', body: JSON.stringify(payload) }),
// };


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
  getConversations: (params?: { status?: string; channel?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.channel) query.set('channel', params.channel);
    const qs = query.toString();
    return apiFetch(`/conversations/${qs ? `?${qs}` : ''}`);
  },
  getConversation: (id: string) => apiFetch(`/conversations/${id}`),
  updateStatus: (id: string, status: string) =>
    apiFetch(`/conversations/${id}/status?status=${status}`, { method: 'PATCH' }),
  getClients: () => apiFetch('/clients/'),
  getClient: (id: string) => apiFetch(`/clients/${id}`),
  chat: (payload: object) =>
    apiFetch('/agent/chat', { method: 'POST', body: JSON.stringify(payload) }),
  getTasks: () => apiFetch('/tasks/'),
  updateTaskStatus: (cardId: string, listName: string) =>
    apiFetch(`/tasks/${cardId}/status?list_name=${encodeURIComponent(listName)}`, { method: 'PATCH' }),
};
