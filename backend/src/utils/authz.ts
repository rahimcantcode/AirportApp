import type { Request } from 'express';
import { ApiError } from './errors.js';

export type ActorRole = 'admin' | 'airline-staff' | 'gate-staff' | 'ground-staff' | 'passenger';

export interface Actor {
  id?: string;
  role?: ActorRole;
  airline?: string;
}

export function getActor(req: Request): Actor {
  const role = (req.header('x-user-role') || '').trim() as ActorRole;
  const id = (req.header('x-user-id') || '').trim();
  const airline = (req.header('x-user-airline') || '').trim().toUpperCase();
  return {
    id: id || undefined,
    role: role || undefined,
    airline: airline || undefined,
  };
}

export function assertRole(req: Request, allowed: ActorRole[]): Actor {
  const actor = getActor(req);
  if (!actor.role || !allowed.includes(actor.role)) {
    throw new ApiError(403, 'Forbidden: insufficient role permission');
  }
  return actor;
}

export function assertAirlineAccess(actor: Actor, airlineCode: string): void {
  if (actor.role === 'airline-staff' || actor.role === 'gate-staff') {
    if (!actor.airline || actor.airline !== (airlineCode || '').toUpperCase()) {
      throw new ApiError(403, 'Forbidden: cross-airline access is not allowed');
    }
  }
}

