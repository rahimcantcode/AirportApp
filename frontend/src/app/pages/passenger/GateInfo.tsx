import React from 'react';
import { useApp } from '@/app/context/AppContext';
import { Plane, MapPin, Clock } from 'lucide-react';

export function GateInfo() {
  const { currentUser, passengers, flights } = useApp();

  const passenger = passengers.find(p => p.id === currentUser?.id);
  const flight = passenger ? flights.find(f => f.id === passenger.flightId) : null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Gate Information</h1>
        <p className="text-gray-500 mt-1">Your flight details and gate assignment</p>
      </div>

      {!flight ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No flight information available</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {/* Flight Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gray-900 p-4 rounded-lg">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {flight.airlineCode} {flight.flightNumber}
                </h2>
                <span className={`inline-flex px-3 py-1 text-sm rounded-full mt-2 ${
                  flight.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                  flight.status === 'boarding' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {flight.status === 'boarding' ? 'Now Boarding' : flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Gate Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-6 h-6 text-gray-600" />
                  <p className="text-sm font-medium text-gray-600">Gate Number</p>
                </div>
                <p className="text-4xl font-semibold text-gray-900">{flight.gate}</p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-gray-600" />
                  <p className="text-sm font-medium text-gray-600">Boarding Status</p>
                </div>
                <p className="text-2xl font-semibold text-gray-900">
                  {flight.status === 'boarding' ? 'Boarding Now' : 
                   flight.status === 'departed' ? 'Departed' : 'Not Started'}
                </p>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Your Booking Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Passenger Name</p>
                  <p className="font-medium text-gray-900">{passenger?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ticket Number</p>
                  <p className="font-medium text-gray-900">{passenger?.ticketNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Boarding Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    passenger?.status === 'not-checked-in' ? 'bg-gray-100 text-gray-800' :
                    passenger?.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {passenger?.status === 'not-checked-in' ? 'Not Checked In' :
                     passenger?.status === 'checked-in' ? 'Checked In' : 'Boarded'}
                  </span>
                </div>
              </div>
            </div>

            {/* Boarding Instructions */}
            {flight.status === 'boarding' && passenger?.status === 'checked-in' && (
              <div className="mt-6 p-6 bg-yellow-50 rounded-lg border-2 border-yellow-400">
                <h3 className="font-semibold text-yellow-900 mb-2">🔔 Boarding Now!</h3>
                <p className="text-yellow-800">
                  Please proceed to Gate {flight.gate}. Have your boarding pass and ID ready.
                </p>
              </div>
            )}

            {passenger?.status === 'not-checked-in' && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Check-In Required</h3>
                <p className="text-gray-700">
                  Please check in at the airline counter before proceeding to the gate.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
