import { ApiError } from './errors.js';

export const FLIGHT_ID_RE = /^[A-Z]{2}\d{4}$/;
export const TICKET_RE = /^\d{10}$/;
export const IDENTIFICATION_RE = /^\d{6}$/;
export const BAG_ID_RE = /^\d{6}$/;
export const USERNAME_RE = /^[A-Za-z]{2,}\d{2,}$/;

export function assertFlightId(value: string, field = 'flightId'): void {
  if (!FLIGHT_ID_RE.test((value || '').toUpperCase())) {
    throw new ApiError(400, `${field} must match format AA1234`);
  }
}

export function assertAirlineCode(value: string): void {
  if (!/^[A-Z]{2}$/.test((value || '').toUpperCase())) {
    throw new ApiError(400, 'airlineCode must be exactly 2 letters');
  }
}

export function assertFlightNumber(value: string): void {
  if (!/^\d{4}$/.test((value || '').trim())) {
    throw new ApiError(400, 'flightNumber must be exactly 4 digits');
  }
}

export function assertTicketNumber(value: string): void {
  if (!TICKET_RE.test((value || '').trim())) {
    throw new ApiError(400, 'ticketNumber must be exactly 10 digits');
  }
}

export function assertIdentification(value: string): void {
  if (!IDENTIFICATION_RE.test((value || '').trim())) {
    throw new ApiError(400, 'identificationNumber must be exactly 6 digits');
  }
}

export function assertBagId(value: string): void {
  if (!BAG_ID_RE.test((value || '').trim())) {
    throw new ApiError(400, 'bagId must be exactly 6 digits');
  }
}

export function assertPassengerStatus(value: string): void {
  if (!['not-checked-in', 'checked-in', 'boarded'].includes(value)) {
    throw new ApiError(400, 'status must be one of not-checked-in, checked-in, boarded');
  }
}

export function assertBagLocation(value: string): void {
  if (!['check-in-counter', 'security-check', 'gate', 'loaded'].includes(value)) {
    throw new ApiError(400, 'location must be one of check-in-counter, security-check, gate, loaded');
  }
}

export function assertStrongPassword(value: string): void {
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(value || '')) {
    throw new ApiError(400, 'password must be at least 6 chars and include uppercase, lowercase, and a number');
  }
}

