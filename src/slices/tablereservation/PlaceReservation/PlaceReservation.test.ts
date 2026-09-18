import {DeciderSpecification} from '@event-driven-io/emmett';
import {
    PlaceReservationCommand,
    PlaceReservationInitialState,
    decide,
    evolve,
} from './PlaceReservationCommand';
import {describe, it} from 'node:test';

describe('Place Reservation Specification', () => {
    const given = DeciderSpecification.for({
        decide,
        evolve,
        initialState: PlaceReservationInitialState,
    });

    const givenWithFixedCode = DeciderSpecification.for({
        decide: (command: PlaceReservationCommand, state: Parameters<typeof evolve>[0]) =>
            decide(command, state, () => '12ZD3C'),
        evolve,
        initialState: PlaceReservationInitialState,
    });

    it('spec: Place Reservation - Successfully place a reservation', () => {
        const command: PlaceReservationCommand = {
            type: 'PlaceReservation',
            data: {
                email: 'hey@email.com',
                day: '20206-10-12',
                start_time: '11:00',
                end_time: '13:00',
                guests_number: 4,
            },
            metadata: {},
        };

        givenWithFixedCode([])
            .when(command)
            .then([{
                type: 'ReservationPlaced',
                data: {
                    reservation_code: '12ZD3C',
                    email: 'hey@email.com',
                    day: '20206-10-12',
                    start_time: '11:00',
                    end_time: '13:00',
                    guests_number: 4,
                },
                metadata: {
                    correlation_id: undefined,
                    causation_id: undefined,
                },
            }]);
    });

    it('spec: Place Reservation - Reservation in the past is not allowed', () => {
        const command: PlaceReservationCommand = {
            type: 'PlaceReservation',
            data: {
                email: 'hey@email.com',
                day: '1988-10-12',
                start_time: '11:00',
                end_time: '13:00',
                guests_number: 4,
            },
            metadata: {},
        };

        given([])
            .when(command)
            .thenThrows();
    });

    it('spec: Place Reservation - Start time must be before end time', () => {
        const command: PlaceReservationCommand = {
            type: 'PlaceReservation',
            data: {
                email: 'hey@email.com',
                day: '20206-10-12',
                start_time: '22:00',
                end_time: '13:00',
                guests_number: 4,
            },
            metadata: {},
        };

        given([])
            .when(command)
            .thenThrows();
    });

    it('spec: Place Reservation - Reservation cannot overlap', () => {
        const command: PlaceReservationCommand = {
            type: 'PlaceReservation',
            data: {
                email: 'hey@email.com',
                day: '20206-10-12',
                start_time: '11:30',
                end_time: '14:00',
                guests_number: 4,
            },
            metadata: {},
        };

        given([{
            type: 'ReservationPlaced',
            data: {
                reservation_code: '12ZD3C',
                email: 'hey@email.com',
                day: '20206-10-12',
                start_time: '11:00',
                end_time: '13:00',
                guests_number: 4,
            },
            metadata: {},
        }])
            .when(command)
            .thenThrows();
    });

    it('spec: Place Reservation - Guest number must be positive', () => {
        const command: PlaceReservationCommand = {
            type: 'PlaceReservation',
            data: {
                email: 'hey@email.com',
                day: '20206-10-12',
                start_time: '11:00',
                end_time: '13:00',
                guests_number: 0,
            },
            metadata: {},
        };

        given([])
            .when(command)
            .thenThrows();
    });
});
