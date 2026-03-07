import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'airline-staff' | 'gate-staff' | 'ground-staff' | 'passenger' | null;
export type GroundMode = 'security-clearance' | 'gate-ops' | null;

export interface User {
  id: string;
  username: string;
  role: UserRole;
  airline?: string; // For airline and gate staff
}

export interface Flight {
  id: string;
  airlineCode: string;      // e.g., "AA"
  flightNumber: string;     // e.g., "0123"
  destination: string;
  gate: string;             // e.g., "T1-G23"
}

export type PassengerStatus = 'not-checked-in' | 'checked-in' | 'boarded';

export interface Passenger {
  id: string;
  name: string;
  ticketNumber: string;            // 10-digit in spec, kept as string in UI
  identificationNumber?: string;   // 6-digit in spec, kept as string in UI
  flightId: string;
  status: PassengerStatus;
}

export type BagLocation = 'check-in-counter' | 'security-check' | 'gate' | 'loaded';

export interface Bag {
  id: string;
  bagId: string;            // 6-digit in spec, kept as string in UI
  ticketNumber: string;
  passengerId: string;
  flightId: string;
  gate: string;             // Derived from flight at time of creation, used for routing
  location: BagLocation;
  locationDetail?: string;  // e.g., "T1-C05" or "T1-G23"
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
  password: string; // In a real app: hashed, never displayed. Here we still avoid showing it in the UI.
  role: StaffRole;
  airline?: string; // Airline code for airline/gate staff
}

export type MessageRole = 'admin' | 'airline-staff' | 'gate-staff' | 'ground-staff';

export interface Message {
  id: string;
  board: MessageRole;       // Which board this message belongs to
  airline?: string;         // For airline-scoped boards
  subject: string;
  content: string;
  bagId?: string;
  ticketNumber?: string;
  passengerId?: string;
  flightId?: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  read?: boolean;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  flights: Flight[];
  passengers: Passenger[];
  staff: Staff[];
  bags: Bag[];
  messages: Message[];

  // UI session selections
  selectedGate: string | null;
  setSelectedGate: (gate: string | null) => void;
  groundMode: GroundMode;
  setGroundMode: (mode: GroundMode) => void;

  // CRUD
  addFlight: (flight: Flight) => void;
  removeFlight: (id: string) => void;
  updateFlight: (flight: Flight) => void;

  addPassenger: (passenger: Passenger) => void;
  removePassenger: (id: string) => void;
  updatePassenger: (passenger: Passenger) => void;

  addStaff: (staff: Omit<Staff, 'id' | 'username' | 'password'>) => { username: string; password: string };
  removeStaff: (id: string) => void;

  addBag: (bag: Bag) => void;
  updateBag: (bag: Bag) => void;
  removeBag: (id: string) => void;
  removeBagsByPassenger: (passengerId: string) => void;

  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  markMessageRead: (id: string, read: boolean) => void;

  showBanner: (message: string, type: 'success' | 'error') => void;
  banner: { message: string; type: 'success' | 'error' } | null;
  clearBanner: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialFlights: Flight[] = [
  { id: '1', airlineCode: 'DL', flightNumber: '0245', destination: 'Atlanta', gate: 'T1-G12' },
  { id: '2', airlineCode: 'AA', flightNumber: '0108', destination: 'Chicago', gate: 'T1-G23' },
];

const initialPassengers: Passenger[] = [
  { id: '1', name: 'Alice Passenger', ticketNumber: '1234567890', identificationNumber: '123456', flightId: '1', status: 'not-checked-in' },
  { id: '2', name: 'Bob Passenger', ticketNumber: '0987654321', identificationNumber: '654321', flightId: '2', status: 'checked-in' },
];

const initialStaff: Staff[] = [
  { id: '1', firstName: 'Alice', lastName: 'Airline', email: 'alice.airline@example.com', phone: '2145550101', username: 'al01', password: 'Passw1', role: 'airline-staff', airline: 'AA' },
  { id: '2', firstName: 'Bob', lastName: 'Gate', email: 'bob.gate@example.com', phone: '2145550102', username: 'bg02', password: 'Passw1', role: 'gate-staff', airline: 'AA' },
  { id: '3', firstName: 'Charlie', lastName: 'Ground', email: 'charlie.ground@example.com', phone: '2145550103', username: 'cg03', password: 'Passw1', role: 'ground-staff' },
];

const initialBags: Bag[] = [
  { id: '1', bagId: '100001', ticketNumber: '0987654321', passengerId: '2', flightId: '2', gate: 'T1-G23', location: 'check-in-counter', locationDetail: 'T1-C05' },
  { id: '2', bagId: '100002', ticketNumber: '0987654321', passengerId: '2', flightId: '2', gate: 'T1-G23', location: 'check-in-counter', locationDetail: 'T1-C05' },
];

const initialMessages: Message[] = [
  {
    id: 'm1',
    board: 'ground-staff',
    subject: 'Shift Assignment',
    content: 'Select Security Clearance or Gate Ops before updating bag locations.',
    severity: 'info',
    timestamp: new Date(),
    read: true,
  },
];

// Credential helpers (lightweight for class project)
function randomDigits(count: number): string {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 10)).join('');
}

function generateUsername(firstName: string, lastName: string): string {
  const base = (firstName[0] || 'u') + (lastName[0] || 's');
  return (base.toLowerCase() + randomDigits(2)).slice(0, 4);
}

function generatePassword(): string {
  // 6+ chars with Upper, lower, number
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  const core = [pick(upper), pick(lower), pick(nums), pick(lower), pick(lower), pick(nums)];
  return core.join('');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[1-9]\d{9}$/.test(phone);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [flights, setFlights] = useState<Flight[]>(initialFlights);
  const [passengers, setPassengers] = useState<Passenger[]>(initialPassengers);
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [bags, setBags] = useState<Bag[]>(initialBags);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [groundMode, setGroundMode] = useState<GroundMode>(null);

  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showBanner = (message: string, type: 'success' | 'error') => setBanner({ message, type });
  const clearBanner = () => setBanner(null);

  const addFlight = (flight: Flight) => {
    setFlights(prev => [...prev, flight]);
    showBanner('Flight added successfully', 'success');
  };

  const removeFlight = (id: string) => {
    setFlights(prev => prev.filter(f => f.id !== id));
    // Also remove related passengers and bags for safety in demo
    setPassengers(prev => prev.filter(p => p.flightId !== id));
    setBags(prev => prev.filter(b => b.flightId !== id));
    showBanner('Flight removed successfully', 'success');
  };

  const updateFlight = (flight: Flight) => {
    setFlights(prev => prev.map(f => (f.id === flight.id ? flight : f)));
    // Keep bags routed to gate if gate changes
    setBags(prev => prev.map(b => (b.flightId === flight.id ? { ...b, gate: flight.gate } : b)));
    showBanner('Flight updated successfully', 'success');
  };

  const addPassenger = (passenger: Passenger) => {
    setPassengers(prev => [...prev, passenger]);
    showBanner('Passenger added successfully', 'success');
  };

  const removePassenger = (id: string) => {
    setPassengers(prev => prev.filter(p => p.id !== id));
    setBags(prev => prev.filter(b => b.passengerId !== id));
    showBanner('Passenger removed successfully', 'success');
  };

  const updatePassenger = (passenger: Passenger) => {
    setPassengers(prev => prev.map(p => (p.id === passenger.id ? passenger : p)));
    showBanner('Passenger updated successfully', 'success');
  };

  // In a real app, you'd integrate a transactional email provider
  const sendCredentialsEmail = (email: string, username: string, password: string) => {
    console.log('[DEV EMAIL]', { to: email, username, password });
  };

  const addStaff = (newStaff: Omit<Staff, 'id' | 'username' | 'password'>) => {
    if (!isValidEmail(newStaff.email)) {
      showBanner('Invalid email format', 'error');
      return { username: '', password: '' };
    }
    if (!isValidPhone(newStaff.phone)) {
      showBanner('Phone number must be 10 digits and cannot start with 0', 'error');
      return { username: '', password: '' };
    }

    const username = generateUsername(newStaff.firstName, newStaff.lastName);
    const password = generatePassword();

    const staffMember: Staff = {
      ...newStaff,
      id: Date.now().toString(),
      username,
      password,
    };

    setStaff(prev => [...prev, staffMember]);

    // Simulate emailing credentials (required by spec)
    sendCredentialsEmail(newStaff.email, username, password);

    showBanner('Staff added successfully. Credentials sent by email (simulated).', 'success');
    return { username, password };
  };

  const removeStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    showBanner('Staff removed successfully', 'success');
  };

  const addBag = (bag: Bag) => {
    setBags(prev => [...prev, bag]);
    showBanner('Bag added successfully', 'success');
  };

  const updateBag = (bag: Bag) => {
    setBags(prev => prev.map(b => (b.id === bag.id ? bag : b)));
    showBanner('Bag updated successfully', 'success');
  };

  const removeBag = (id: string) => {
    setBags(prev => prev.filter(b => b.id !== id));
    showBanner('Bag removed successfully', 'success');
  };

  const removeBagsByPassenger = (passengerId: string) => {
    setBags(prev => prev.filter(b => b.passengerId !== passengerId));
    showBanner('All passenger bags removed successfully', 'success');
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [
      ...prev,
      {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
      },
    ]);
    showBanner('Message posted to board', 'success');
  };

  const markMessageRead = (id: string, read: boolean) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, read } : m)));
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
