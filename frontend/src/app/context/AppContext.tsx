import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Role = 'admin' | 'airline' | 'gate' | 'ground' | 'passenger';

export type User = {
  id: string;
  username: string;
  password: string; // stored locally for demo; never display in UI
  role: Role;
  email?: string;
  phone?: string;
};

export type Flight = {
  id: string;
  airlineFlightNo: string; // AA1234
  origin: string;
  destination: string;
  departureTime: string; // ISO string
  gate: string;
};

export type Passenger = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  ticketNumber: string; // 10 digits
  flightId: string;
  luggageId: string; // 6 digits
  checkedIn: boolean;
  boarded: boolean;
};

export type BagEvent = {
  id: string;
  luggageId: string;
  timestamp: string;
  location: string;
  status: 'created' | 'received_security' | 'cleared_security' | 'at_gate' | 'loaded_plane';
  gate?: string;
};

export type Message = {
  id: string;
  fromUsername: string;
  toRole: 'admin' | 'airline' | 'gate' | 'ground';
  body: string;
  timestamp: string;
};

export type Toast = {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
};

type AppState = {
  currentUser: User | null;
  users: User[];
  flights: Flight[];
  passengers: Passenger[];
  bagEvents: BagEvent[];
  messages: Message[];
  toasts: Toast[];

  login: (username: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  resetPassword: (username: string, newPassword: string) => { ok: boolean; error?: string };

  addToast: (t: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  addFlight: (f: Omit<Flight, 'id'>) => { ok: boolean; error?: string };
  removeFlight: (id: string) => void;

  addPassenger: (p: Omit<Passenger, 'id' | 'checkedIn' | 'boarded'>) => { ok: boolean; error?: string };
  updatePassenger: (id: string, patch: Partial<Passenger>) => void;

  addUser: (u: Omit<User, 'id'>) => { ok: boolean; error?: string };

  addMessage: (m: Omit<Message, 'id' | 'timestamp'>) => void;

  addBagEvent: (e: Omit<BagEvent, 'id' | 'timestamp'>) => void;
};

const STORAGE_KEY = 'airportapp_state_v1';

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function loadInitialState(): Pick<AppState, 'users' | 'flights' | 'passengers' | 'bagEvents' | 'messages' | 'currentUser' | 'toasts'> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        users: parsed.users || [],
        flights: parsed.flights || [],
        passengers: parsed.passengers || [],
        bagEvents: parsed.bagEvents || [],
        messages: parsed.messages || [],
        currentUser: parsed.currentUser || null,
        toasts: [],
      };
    } catch {
      // fall through to seed
    }
  }

  // Seed data so the demo works out of the box
  const seedUsers: User[] = [
    { id: uid('u'), username: 'admin', password: 'Admin123', role: 'admin', email: 'admin@aa.com', phone: '2145551234' },
    { id: uid('u'), username: 'smith01', password: 'Pass1234', role: 'airline', email: 'smith@aa.com', phone: '2145551111' },
    { id: uid('u'), username: 'johnson02', password: 'Pass1234', role: 'gate', email: 'johnson@aa.com', phone: '2145552222' },
    { id: uid('u'), username: 'brown03', password: 'Pass1234', role: 'ground', email: 'brown@aa.com', phone: '2145553333' },
    { id: uid('u'), username: 'lee04', password: 'Pass1234', role: 'passenger', email: 'lee@aa.com', phone: '2145554444' },
  ];

  const seedFlights: Flight[] = [
    {
      id: uid('f'),
      airlineFlightNo: 'AA1234',
      origin: 'DFW',
      destination: 'LAX',
      departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      gate: 'A12',
    },
    {
      id: uid('f'),
      airlineFlightNo: 'DL5678',
      origin: 'DFW',
      destination: 'JFK',
      departureTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      gate: 'B05',
    },
  ];

  const seedPassengers: Passenger[] = [
    {
      id: uid('p'),
      fullName: 'Rahim Latreche',
      email: 'rahim@smu.edu',
      phone: '2145557777',
      ticketNumber: '1234567890',
      flightId: seedFlights[0].id,
      luggageId: '654321',
      checkedIn: false,
      boarded: false,
    },
  ];

  const seedBagEvents: BagEvent[] = [
    {
      id: uid('be'),
      luggageId: '654321',
      timestamp: new Date().toISOString(),
      location: 'Baggage Drop',
      status: 'created',
    },
  ];

  return {
    users: seedUsers,
    flights: seedFlights,
    passengers: seedPassengers,
    bagEvents: seedBagEvents,
    messages: [],
    currentUser: null,
    toasts: [],
  };
}

function persist(state: Pick<AppState, 'users' | 'flights' | 'passengers' | 'bagEvents' | 'messages' | 'currentUser'>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => loadInitialState(), []);

  const [currentUser, setCurrentUser] = useState<User | null>(initial.currentUser);
  const [users, setUsers] = useState<User[]>(initial.users);
  const [flights, setFlights] = useState<Flight[]>(initial.flights);
  const [passengers, setPassengers] = useState<Passenger[]>(initial.passengers);
  const [bagEvents, setBagEvents] = useState<BagEvent[]>(initial.bagEvents);
  const [messages, setMessages] = useState<Message[]>(initial.messages);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    persist({ users, flights, passengers, bagEvents, messages, currentUser });
  }, [users, flights, passengers, bagEvents, messages, currentUser]);

  const addToast = (t: Omit<Toast, 'id'>) => {
    const id = uid('toast');
    setToasts((prev) => [{ id, ...t }, ...prev]);

    // auto-dismiss, but keep user control too
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id));

  const login: AppState['login'] = (username, password) => {
    const found = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!found || found.password !== password) {
      return { ok: false, error: 'Invalid username or password.' };
    }
    setCurrentUser(found);
    return { ok: true };
  };

  const logout = () => {
    setCurrentUser(null);
    window.location.hash = '';
  };

  const resetPassword: AppState['resetPassword'] = (username, newPassword) => {
    const idx = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());
    if (idx < 0) return { ok: false, error: 'User not found.' };
    setUsers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], password: newPassword };
      return next;
    });
    return { ok: true };
  };

  const addFlight: AppState['addFlight'] = (f) => {
    setFlights((prev) => [...prev, { ...f, id: uid('f') }]);
    return { ok: true };
  };

  const removeFlight = (id: string) => {
    setFlights((prev) => prev.filter((x) => x.id !== id));
    // keep passengers, but they will show as missing flight until reassigned
  };

  const addPassenger: AppState['addPassenger'] = (p) => {
    setPassengers((prev) => [...prev, { ...p, id: uid('p'), checkedIn: false, boarded: false }]);
    return { ok: true };
  };

  const updatePassenger = (id: string, patch: Partial<Passenger>) => {
    setPassengers((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const addUser: AppState['addUser'] = (u) => {
    setUsers((prev) => [...prev, { ...u, id: uid('u') }]);
    return { ok: true };
  };

  const addMessage: AppState['addMessage'] = (m) => {
    setMessages((prev) => [{ ...m, id: uid('msg'), timestamp: new Date().toISOString() }, ...prev]);
  };

  const addBagEvent: AppState['addBagEvent'] = (e) => {
    setBagEvents((prev) => [{ ...e, id: uid('be'), timestamp: new Date().toISOString() }, ...prev]);
  };

  const value: AppState = {
    currentUser,
    users,
    flights,
    passengers,
    bagEvents,
    messages,
    toasts,
    login,
    logout,
    resetPassword,
    addToast,
    removeToast,
    addFlight,
    removeFlight,
    addPassenger,
    updatePassenger,
    addUser,
    addMessage,
    addBagEvent,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
