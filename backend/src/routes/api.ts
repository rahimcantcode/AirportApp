import { Router } from 'express';
import { listFlights, createFlight, updateFlight, deleteFlight } from '../services/flightsService.js';
import {
  listPassengers,
  createPassenger,
  updatePassenger,
  deletePassenger,
  listPassengersByFlightId,
  deletePassengerById,
  getPassengerByTicket,
} from '../services/passengersService.js';
import { listBags, createBag, updateBag, deleteBag, getBagById } from '../services/bagsService.js';
import { getGateByLabel, listGates } from '../services/gatesService.js';
import { listAirlines } from '../services/airlinesService.js';
import { listMessages, createMessage, markMessageRead } from '../services/messagesService.js';
import { createStaff, deleteStaff, listStaff } from '../services/staffService.js';
import { grantGroundStaffBagAccess, listGroundStaffBagAccess, revokeGroundStaffBagAccess } from '../services/accessService.js';
import { getFlightById } from '../services/flightsService.js';
import { assertAirlineAccess, assertRole, getActor } from '../utils/authz.js';

export const apiRouter = Router();

apiRouter.get('/bootstrap', async (_req, res, next) => {
  try {
    const [flights, passengers, bags, airlines, gates, messages, staff] = await Promise.all([
      listFlights(),
      listPassengers(),
      listBags(),
      listAirlines(),
      listGates(),
      listMessages(),
      listStaff(),
    ]);

    res.json({ flights, passengers, bags, airlines, gates, messages, staff });
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/flights', async (_req, res, next) => {
  try {
    res.json(await listFlights());
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/flights/:id', async (req, res, next) => {
  try {
    const actor = assertRole(req, ['admin', 'airline-staff', 'gate-staff', 'ground-staff']);
    const flight = await getFlightById(req.params.id);
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    assertAirlineAccess(actor, flight.airlineCode);
    return res.json(flight);
  } catch (error) {
    return next(error);
  }
});

apiRouter.get('/flights/:id/passengers', async (req, res, next) => {
  try {
    const actor = assertRole(req, ['admin', 'airline-staff', 'gate-staff', 'ground-staff']);
    const flight = await getFlightById(req.params.id);
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    assertAirlineAccess(actor, flight.airlineCode);
    res.json(await listPassengersByFlightId(req.params.id));
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/flights', async (req, res, next) => {
  try {
    assertRole(req, ['admin']);
    res.status(201).json(await createFlight(req.body));
  } catch (error) {
    next(error);
  }
});

apiRouter.patch('/flights/:id', async (req, res, next) => {
  try {
    assertRole(req, ['admin']);
    res.json(await updateFlight(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
});

apiRouter.delete('/flights/:id', async (req, res, next) => {
  try {
    assertRole(req, ['admin']);
    await deleteFlight(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/passengers', async (_req, res, next) => {
  try {
    assertRole(_req, ['admin']);
    res.json(await listPassengers());
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/passengers/:ticketNumber', async (req, res, next) => {
  try {
    const actor = assertRole(req, ['admin', 'airline-staff', 'gate-staff', 'ground-staff']);
    const passenger = await getPassengerByTicket(req.params.ticketNumber);
    if (!passenger) return res.status(404).json({ error: 'Passenger not found' });
    const flight = await getFlightById(passenger.flightId);
    if (!flight) return res.status(404).json({ error: 'Flight not found' });
    assertAirlineAccess(actor, flight.airlineCode);
    return res.json(passenger);
  } catch (error) {
    return next(error);
  }
});

apiRouter.post('/passengers', async (req, res, next) => {
  try {
    assertRole(req, ['admin']);
    res.status(201).json(await createPassenger(req.body));
  } catch (error) {
    next(error);
  }
});

apiRouter.patch('/passengers/:ticketNumber', async (req, res, next) => {
  try {
    const actor = assertRole(req, ['admin', 'airline-staff', 'gate-staff']);
    if (actor.role === 'airline-staff' || actor.role === 'gate-staff') {
      const existing = await getPassengerByTicket(req.params.ticketNumber);
      if (!existing) return res.status(404).json({ error: 'Passenger not found' });
      const flight = await getFlightById(existing.flightId);
      if (!flight) return res.status(404).json({ error: 'Flight not found' });
      assertAirlineAccess(actor, flight.airlineCode);
    }
    res.json(await updatePassenger(req.params.ticketNumber, req.body));
  } catch (error) {
    next(error);
  }
});

apiRouter.delete('/passengers/:ticketNumber', async (req, res, next) => {
  try {
    assertRole(req, ['admin']);
    await deletePassenger(req.params.ticketNumber);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

apiRouter.delete('/passengers/by-id/:passengerId', async (req, res, next) => {
  try {
    assertRole(req, ['admin']);
    await deletePassengerById(req.params.passengerId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/bags', async (req, res, next) => {
  try {
    const actor = assertRole(req, ['admin', 'airline-staff', 'gate-staff', 'ground-staff']);
    const gate = typeof req.query.gate === 'string' ? req.query.gate : undefined;
    const flightId = typeof req.query.flightId === 'string' ? req.query.flightId : undefined;
    if ((actor.role === 'airline-staff' || actor.role === 'gate-staff') && flightId) {
      const flight = await getFlightById(flightId);
      if (!flight) return res.status(404).json({ error: 'Flight not found' });
      assertAirlineAccess(actor, flight.airlineCode);
    }
    res.json(await listBags({ gate, flightId }));
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/bags/:bagId', async (req, res, next) => {
  try {
    const actor = assertRole(req, ['admin', 'airline-staff', 'gate-staff', 'ground-staff', 'passenger']);
    const bag = await getBagById(req.params.bagId);
    if (!bag) return res.status(404).json({ error: 'Bag not found' });
    if (actor.role === 'passenger') {
      const actorId = getActor(req).id;
      if (!actorId || actorId !== bag.ticketNumber) {
        return res.status(403).json({ error: 'Forbidden: passengers can only access own bags' });
      }
    } else {
      const flight = await getFlightById(bag.flightId);
      if (!flight) return res.status(404).json({ error: 'Flight not found' });
      assertAirlineAccess(actor, flight.airlineCode);
    }
    return res.json(bag);
  } catch (error) {
    return next(error);
  }
});

apiRouter.post('/bags', async (req, res, next) => {
  try {
    const actor = assertRole(req, ['admin', 'airline-staff']);
    if (actor.role === 'airline-staff') {
      const flight = await getFlightById(String(req.body?.flightId || ''));
      if (!flight) return res.status(404).json({ error: 'Flight not found' });
      assertAirlineAccess(actor, flight.airlineCode);
    }
    res.status(201).json(await createBag(req.body));
  } catch (error) {
    next(error);
  }
});

apiRouter.patch('/bags/:bagId', async (req, res, next) => {
  try {
    const actor = assertRole(req, ['admin', 'airline-staff', 'ground-staff']);
    const bag = await getBagById(req.params.bagId);
    if (!bag) return res.status(404).json({ error: 'Bag not found' });
    if (actor.role === 'airline-staff') {
      const flight = await getFlightById(bag.flightId);
      if (!flight) return res.status(404).json({ error: 'Flight not found' });
      assertAirlineAccess(actor, flight.airlineCode);
    }
    res.json(await updateBag(req.params.bagId, req.body));
  } catch (error) {
    next(error);
  }
});

apiRouter.delete('/bags/:bagId', async (req, res, next) => {
  try {
    const actor = assertRole(req, ['admin', 'airline-staff']);
    const bag = await getBagById(req.params.bagId);
    if (!bag) return res.status(404).json({ error: 'Bag not found' });
    if (actor.role === 'airline-staff') {
      const flight = await getFlightById(bag.flightId);
      if (!flight) return res.status(404).json({ error: 'Flight not found' });
      assertAirlineAccess(actor, flight.airlineCode);
    }
    await deleteBag(req.params.bagId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/gates', async (_req, res, next) => {
  try {
    res.json(await listGates());
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/gates/:gateNumber', async (req, res, next) => {
  try {
    const gate = await getGateByLabel(req.params.gateNumber);
    if (!gate) return res.status(404).json({ error: 'Gate not found' });
    return res.json(gate);
  } catch (error) {
    return next(error);
  }
});

apiRouter.get('/airlines', async (_req, res, next) => {
  try {
    res.json(await listAirlines());
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/messages', async (_req, res, next) => {
  try {
    res.json(await listMessages());
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/messages', async (req, res, next) => {
  try {
    assertRole(req, ['admin', 'airline-staff', 'gate-staff', 'ground-staff']);
    res.status(201).json(await createMessage(req.body));
  } catch (error) {
    next(error);
  }
});

apiRouter.patch('/messages/:id/read', async (req, res, next) => {
  try {
    assertRole(req, ['admin', 'airline-staff', 'gate-staff', 'ground-staff']);
    res.json(await markMessageRead(req.params.id, Boolean(req.body?.read)));
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/staff', async (_req, res, next) => {
  try {
    assertRole(_req, ['admin']);
    res.json(await listStaff());
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/staff', async (req, res, next) => {
  try {
    assertRole(req, ['admin']);
    res.status(201).json(await createStaff(req.body));
  } catch (error) {
    next(error);
  }
});

apiRouter.delete('/staff/:role/:id', async (req, res, next) => {
  try {
    assertRole(req, ['admin']);
    await deleteStaff(req.params.role as any, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/ground-access', async (_req, res, next) => {
  try {
    res.json(await listGroundStaffBagAccess());
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/ground-access', async (req, res, next) => {
  try {
    await grantGroundStaffBagAccess(Number(req.body?.groundStaffId), String(req.body?.bagId || ''));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

apiRouter.delete('/ground-access/:groundStaffId/:bagId', async (req, res, next) => {
  try {
    await revokeGroundStaffBagAccess(Number(req.params.groundStaffId), req.params.bagId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
