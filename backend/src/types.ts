export type PassengerStatus = 'not-checked-in' | 'checked-in' | 'boarded';

export type BagLocation = 'check-in-counter' | 'security-check' | 'gate' | 'loaded';

export type MessageBoard = 'admin' | 'airline-staff' | 'gate-staff' | 'ground-staff';

export interface FlightDTO {
  id: string;
  airlineCode: string;
  flightNumber: string;
  destination: string;
  gate: string;
  flightStatus: boolean;
  status: 'scheduled' | 'departed';
}

export interface PassengerDTO {
  id: string;
  name: string;
  ticketNumber: string;
  identificationNumber: string;
  flightId: string;
  status: PassengerStatus;
  boarded: number;
}

export interface BagDTO {
  id: string;
  bagId: string;
  ticketNumber: string;
  passengerId: string;
  flightId: string;
  gate: string;
  location: BagLocation;
  locationDetail?: string;
  securityIssue?: boolean;
  bagHistory?: string;
}

export interface AirlineDTO {
  airlineCode: string;
  airlineName: string;
}

export interface GateDTO {
  id: number;
  terminal: string;
  gateNumber: string;
  gate: string;
}

export interface MessageDTO {
  id: string;
  boardType: MessageBoard;
  senderRole?: string;
  senderId?: number;
  relatedFlightId?: string;
  relatedBagId?: string;
  content: string;
  createdAt: string;

  // Compatibility aliases for existing frontend
  board: MessageBoard;
  role: MessageBoard;
  subject: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  ticketNumber?: string;
  passengerId?: string;
  flightId?: string;
  bagId?: string;
  timestamp: string;
  author?: string;
  airline?: string;
}

export interface StaffDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  password?: string;
  role: 'airline-staff' | 'gate-staff' | 'ground-staff';
  airline?: string;
}
