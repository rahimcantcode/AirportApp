import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { api } from '@/app/lib/api';

export type UserRole = 'admin' | 'airline-staff' | 'gate-staff' | 'ground-staff' | 'passenger' | null;
export type GroundMode = 'security-clearance' | 'gate-ops' | null;

export interface User {
  id: string;
  username: string;
  role: UserRole;
  airline?: string;
  mustChangePassword?: boolean;
}

export interface Flight {
  id: string;
  airlineCode: string;
  flightNumber: string;
  destination: string;
  gate: string;
  status: 'scheduled' | 'boarding' | 'departed';
}

export type PassengerStatus = 'not-checked-in' | 'checked-in' | 'boarded';

export interface Passenger {
  id: string;
  name: string;
  ticketNumber: string;
  identificationNumber?: string;
  flightId: string;
  status: PassengerStatus;
}

export type BagLocation = 'check-in-counter' | 'security-check' | 'gate' | 'loaded';

export interface Bag {
  id: string;
  bagId: string;
  ticketNumber: string;
  passengerId: string;
  flightId: string;
  gate: string;
  location: BagLocation;
  locationDetail?: string;
  securityIssue?: boolean;
}

export type StaffRole = 'airline-staff' | 'gate-staff' | 'ground-staff';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  password?: string;
  role: StaffRole;
  airline?: string;
}

export type MessageRole = 'admin' | 'airline-staff' | 'gate-staff' | 'ground-staff';

export interface Message {
  id: string;
  board: MessageRole;
  role?: MessageRole;
  airline?: string;
  subject: string;
  content: string;
  bagId?: string;
  ticketNumber?: string;
  passengerId?: string;
  flightId?: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  read?: boolean;
  author?: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  flights: Flight[];
  passengers: Passenger[];
  staff: Staff[];
  bags: Bag[];
  messages: Message[];

  selectedGate: string | null;
  setSelectedGate: (gate: string | null) => void;
  groundMode: GroundMode;
  setGroundMode: (mode: GroundMode) => void;

  addFlight: (flight: Partial<Flight>) => void;
  removeFlight: (id: string) => void;
  updateFlight: (flight: Flight) => void;

  addPassenger: (passenger: Partial<Passenger>) => void;
  removePassenger: (id: string) => void;
  updatePassenger: (passenger: Passenger) => void;

  addStaff: (staff: Omit<Staff, 'id' | 'username' | 'password'>) => Promise<{ username: string; password: string }>;
  removeStaff: (id: string) => void;

  addBag: (bag: Bag) => void;
  updateBag: (bag: Bag) => void;
  removeBag: (id: string) => void;
  removeBagsByPassenger: (passengerId: string) => void;

  addMessage: (message: Partial<Message>) => void;
  markMessageRead: (id: string, read: boolean) => void;

  showBanner: (message: string, type: 'success' | 'error') => void;
  banner: { message: string; type: 'success' | 'error' } | null;
  clearBanner: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[1-9]\d{9}$/.test(phone);
}

function normalizeMessage(raw: any): Message {
  const board = raw.board || raw.role || raw.boardType;
  return {
    id: String(raw.id),
    board,
    role: raw.role || raw.board || raw.boardType,
    airline: raw.airline,
    subject: raw.subject || 'Operational update',
    content: raw.content || '',
    bagId: raw.bagId,
    ticketNumber: raw.ticketNumber,
    passengerId: raw.passengerId,
    flightId: raw.flightId,
    severity: raw.severity || 'info',
    timestamp: raw.timestamp instanceof Date ? raw.timestamp : new Date(raw.timestamp || Date.now()),
    read: Boolean(raw.read),
    author: raw.author,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('airport_current_user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const [flights, setFlights] = useState<Flight[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [bags, setBags] = useState<Bag[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [groundMode, setGroundMode] = useState<GroundMode>(null);

  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('airport_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('airport_current_user');
      sessionStorage.removeItem('password_reset_username');
      sessionStorage.removeItem('password_reset_required');
    }
  };

  const showBanner = (message: string, type: 'success' | 'error') => setBanner({ message, type });
  const clearBanner = () => setBanner(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await api.bootstrap();
        if (!active) return;
        setFlights(data.flights || []);
        setPassengers(data.passengers || []);
        setBags(data.bags || []);
        setStaff(data.staff || []);
        setMessages((data.messages || []).map(normalizeMessage));
      } catch (error) {
        if (!active) return;
        const message = error instanceof Error ? error.message : 'Failed to load data';
        showBanner(message, 'error');
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const addFlight = (flight: Partial<Flight>) => {
    void (async () => {
      try {
        const created = await api.createFlight({
          airlineCode: flight.airlineCode,
          flightNumber: flight.flightNumber,
          destination: flight.destination || 'TBD',
          gate: flight.gate,
          status: flight.status || 'scheduled',
        });
        setFlights((prev) => [...prev, created]);
        showBanner('Flight added successfully', 'success');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to add flight', 'error');
      }
    })();
  };

  const removeFlight = (id: string) => {
    void (async () => {
      try {
        await api.deleteFlight(id);
        setFlights((prev) => prev.filter((f) => f.id !== id));
        setPassengers((prev) => prev.filter((p) => p.flightId !== id));
        setBags((prev) => prev.filter((b) => b.flightId !== id));
        showBanner('Flight removed successfully', 'success');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to remove flight', 'error');
      }
    })();
  };

  const updateFlight = (flight: Flight) => {
    void (async () => {
      try {
        const updated = await api.updateFlight(flight.id, flight);
        setFlights((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
        setBags((prev) => prev.map((b) => (b.flightId === updated.id ? { ...b, gate: updated.gate } : b)));
        showBanner('Flight updated successfully', 'success');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to update flight', 'error');
      }
    })();
  };

  const addPassenger = (passenger: Partial<Passenger>) => {
    void (async () => {
      try {
        const created = await api.createPassenger({
          name: passenger.name,
          ticketNumber: passenger.ticketNumber,
          identificationNumber: passenger.identificationNumber,
          flightId: passenger.flightId,
          status: passenger.status || 'not-checked-in',
        });
        setPassengers((prev) => [...prev, created]);
        showBanner('Passenger added successfully', 'success');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to add passenger', 'error');
      }
    })();
  };

  const removePassenger = (id: string) => {
    void (async () => {
      try {
        try {
          await api.deletePassenger(id);
        } catch {
          await api.deletePassengerById(id);
        }
        setPassengers((prev) => prev.filter((p) => p.id !== id));
        setBags((prev) => prev.filter((b) => b.passengerId !== id));
        showBanner('Passenger removed successfully', 'success');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to remove passenger', 'error');
      }
    })();
  };

  const updatePassenger = (passenger: Passenger) => {
    void (async () => {
      try {
        const updated = await api.updatePassenger(passenger.ticketNumber, passenger);
        setPassengers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showBanner('Passenger updated successfully', 'success');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to update passenger', 'error');
      }
    })();
  };

  const addStaff = async (newStaff: Omit<Staff, 'id' | 'username' | 'password'>) => {
    if (!isValidEmail(newStaff.email)) {
      showBanner('Invalid email format', 'error');
      return { username: '', password: '' };
    }
    if (!isValidPhone(newStaff.phone)) {
      showBanner('Phone number must be 10 digits and cannot start with 0', 'error');
      return { username: '', password: '' };
    }

    try {
      const response = await api.createStaff(newStaff);
      setStaff((prev) => [...prev, response.staff]);
      showBanner('Staff added successfully. Credentials sent by email (simulated).', 'success');
      return response.credentials || { username: response.staff?.username || '', password: response.staff?.password || '' };
    } catch (error) {
      showBanner(error instanceof Error ? error.message : 'Failed to add staff', 'error');
      return { username: '', password: '' };
    }
  };

  const removeStaff = (id: string) => {
    const member = staff.find((s) => s.id === id);
    if (!member) return;

    void (async () => {
      try {
        await api.deleteStaff(member.role, id);
        setStaff((prev) => prev.filter((s) => s.id !== id));
        showBanner('Staff removed successfully', 'success');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to remove staff', 'error');
      }
    })();
  };

  const addBag = (bag: Bag) => {
    void (async () => {
      try {
        const created = await api.createBag(bag);
        setBags((prev) => [...prev, created]);
        showBanner('Bag added successfully', 'success');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to add bag', 'error');
      }
    })();
  };

  const updateBag = (bag: Bag) => {
    void (async () => {
      try {
        const updated = await api.updateBag(bag.bagId, bag);
        setBags((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        showBanner('Bag updated successfully', 'success');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to update bag', 'error');
      }
    })();
  };

  const removeBag = (id: string) => {
    void (async () => {
      try {
        await api.deleteBag(id);
        setBags((prev) => prev.filter((b) => b.id !== id));
        showBanner('Bag removed successfully', 'success');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to remove bag', 'error');
      }
    })();
  };

  const removeBagsByPassenger = (passengerId: string) => {
    const ids = bags.filter((b) => b.passengerId === passengerId).map((b) => b.id);
    ids.forEach((id) => {
      void api.deleteBag(id);
    });
    setBags((prev) => prev.filter((b) => b.passengerId !== passengerId));
    showBanner('All passenger bags removed successfully', 'success');
  };

  const addMessage = (message: Partial<Message>) => {
    void (async () => {
      try {
        const created = await api.createMessage({
          board: message.board || message.role,
          role: message.role || message.board,
          senderId: currentUser ? Number(currentUser.id) || undefined : undefined,
          airline: message.airline,
          subject: message.subject || 'Operational update',
          content: message.content,
          bagId: message.bagId,
          ticketNumber: message.ticketNumber,
          passengerId: message.passengerId,
          flightId: message.flightId,
          severity: message.severity || 'info',
          read: Boolean(message.read),
          author: message.author,
        });

        setMessages((prev) => [normalizeMessage(created), ...prev]);
        showBanner('Message posted to board', 'success');
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to post message', 'error');
      }
    })();
  };

  const markMessageRead = (id: string, read: boolean) => {
    void (async () => {
      try {
        const updated = await api.markMessageRead(id, read);
        setMessages((prev) => prev.map((m) => (m.id === updated.id ? normalizeMessage(updated) : m)));
      } catch (error) {
        showBanner(error instanceof Error ? error.message : 'Failed to update message', 'error');
      }
    })();
  };

  const value = useMemo<AppContextType>(
    () => ({
      currentUser,
      setCurrentUser,

      flights,
      passengers,
      staff,
      bags,
      messages,

      selectedGate,
      setSelectedGate,
      groundMode,
      setGroundMode,

      addFlight,
      removeFlight,
      updateFlight,

      addPassenger,
      removePassenger,
      updatePassenger,

      addStaff,
      removeStaff,

      addBag,
      updateBag,
      removeBag,
      removeBagsByPassenger,

      addMessage,
      markMessageRead,

      showBanner,
      banner,
      clearBanner,
    }),
    [currentUser, flights, passengers, staff, bags, messages, selectedGate, groundMode, banner]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
