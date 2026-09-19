"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emmett_1 = require("@event-driven-io/emmett");
const PlaceReservationCommand_1 = require("./PlaceReservationCommand");
const node_test_1 = require("node:test");
(0, node_test_1.describe)('Place Reservation Specification', () => {
    const given = emmett_1.DeciderSpecification.for({
        decide: PlaceReservationCommand_1.decide,
        evolve: PlaceReservationCommand_1.evolve,
        initialState: PlaceReservationCommand_1.PlaceReservationInitialState,
    });
    const givenWithFixedIds = emmett_1.DeciderSpecification.for({
        decide: (command, state) => (0, PlaceReservationCommand_1.decide)(command, state, 'test-reservation-id', '12ZD3C'),
        evolve: PlaceReservationCommand_1.evolve,
        initialState: PlaceReservationCommand_1.PlaceReservationInitialState,
    });
    (0, node_test_1.it)('spec: Place Reservation - Successfully place a reservation', () => {
        const command = {
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
        givenWithFixedIds([])
            .when(command)
            .then([{
                type: 'ReservationPlaced',
                data: {
                    reservation_id: 'test-reservation-id',
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
    (0, node_test_1.it)('spec: Place Reservation - Reservation in the past is not allowed', () => {
        const command = {
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
    (0, node_test_1.it)('spec: Place Reservation - Start time must be before end time', () => {
        const command = {
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
    (0, node_test_1.it)('spec: Place Reservation - Reservation cannot overlap', () => {
        const command = {
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
                    reservation_id: 'existing-reservation-id',
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
    (0, node_test_1.it)('spec: Place Reservation - Guest number must be positive', () => {
        const command = {
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
