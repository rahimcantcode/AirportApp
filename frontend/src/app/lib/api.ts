const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3001';

function buildAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem('airport_current_user');
    if (!raw) return {};
    const user = JSON.parse(raw) as { id?: string; role?: string; airline?: string };
    const headers: Record<string, string> = {};
    if (user.id) headers['x-user-id'] = String(user.id);
    if (user.role) headers['x-user-role'] = String(user.role);
    if (user.airline) headers['x-user-airline'] = String(user.airline);
    return headers;
  } catch {
    return {};
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(),
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  bootstrap: () => request<any>('/api/bootstrap'),

  staffLogin: (username: string, password: string) =>
    request<any>('/api/auth/staff-login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  passengerLogin: (identificationNumber: string, ticketNumber: string) =>
    request<any>('/api/auth/passenger-login', {
      method: 'POST',
      body: JSON.stringify({ identificationNumber, ticketNumber }),
    }),
  changePassword: (payload: { username: string; currentPassword: string; newPassword: string }) =>
    request<{ ok: boolean }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  createFlight: (payload: any) =>
    request<any>('/api/flights', { method: 'POST', body: JSON.stringify(payload) }),
  getFlightById: (id: string) => request<any>(`/api/flights/${id}`),
  getPassengersByFlightId: (id: string) => request<any>(`/api/flights/${id}/passengers`),
  updateFlight: (id: string, payload: any) =>
    request<any>(`/api/flights/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteFlight: (id: string) => request<void>(`/api/flights/${id}`, { method: 'DELETE' }),

  createPassenger: (payload: any) =>
    request<any>('/api/passengers', { method: 'POST', body: JSON.stringify(payload) }),
  updatePassenger: (ticketNumber: string, payload: any) =>
    request<any>(`/api/passengers/${ticketNumber}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deletePassenger: (ticketNumber: string) => request<void>(`/api/passengers/${ticketNumber}`, { method: 'DELETE' }),
  deletePassengerById: (passengerId: string) => request<void>(`/api/passengers/by-id/${passengerId}`, { method: 'DELETE' }),

  getBagById: (bagId: string) => request<any>(`/api/bags/${bagId}`),
  listBagsByGate: (gate: string) => request<any>(`/api/bags?gate=${encodeURIComponent(gate)}`),
  listBagsByFlightId: (flightId: string) => request<any>(`/api/bags?flightId=${encodeURIComponent(flightId)}`),
  createBag: (payload: any) =>
    request<any>('/api/bags', { method: 'POST', body: JSON.stringify(payload) }),
  updateBag: (bagId: string, payload: any) =>
    request<any>(`/api/bags/${bagId}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteBag: (bagId: string) => request<void>(`/api/bags/${bagId}`, { method: 'DELETE' }),
  getGateByNumber: (gate: string) => request<any>(`/api/gates/${encodeURIComponent(gate)}`),

  createMessage: (payload: any) =>
    request<any>('/api/messages', { method: 'POST', body: JSON.stringify(payload) }),
  markMessageRead: (id: string, read: boolean) =>
    request<any>(`/api/messages/${id}/read`, { method: 'PATCH', body: JSON.stringify({ read }) }),

  createStaff: (payload: any) =>
    request<any>('/api/staff', { method: 'POST', body: JSON.stringify(payload) }),
  deleteStaff: (role: string, id: string) => request<void>(`/api/staff/${role}/${id}`, { method: 'DELETE' }),
};
