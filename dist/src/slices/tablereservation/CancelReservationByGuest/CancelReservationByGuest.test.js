"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emmett_1 = require("@event-driven-io/emmett");
const CancelReservationByGuestCommand_1 = require("./CancelReservationByGuestCommand");
const node_test_1 = require("node:test");
(0, node_test_1.describe)('Cancel Reservation by Guest Specification', () => {
    const given = emmett_1.DeciderSpecification.for({
        decide: CancelReservationByGuestCommand_1.decide,
        evolve: CancelReservationByGuestCommand_1.evolve,
        initialState: CancelReservationByGuestCommand_1.CancelReservationByGuestInitialState,
    });
    (0, node_test_1.it)('spec: Cancel Reservation by Guest - Successfully cancel a reservation', () => {
        const command = {
            type: 'CancelReservationByGuest',
            data: {
                reservation_id: '1232-ASD-123',
            },
            metadata: {},
        };
        given([{
                type: 'ReservationPlaced',
                data: {
                    reservation_id: '1232-ASD-123',
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
            .then([{
                type: 'ReservationCancelledByGuest',
                data: {
                    reservation_id: '1232-ASD-123',
                },
                metadata: {
                    correlation_id: undefined,
                    causation_id: undefined,
                },
            }]);
    });
    (0, node_test_1.it)('spec: Cancel Reservation by Guest - Cancelling a cancelled reservation fails', () => {
        const command = {
            type: 'CancelReservationByGuest',
            data: {
                reservation_id: '1232-ASD-123',
            },
            metadata: {},
        };
        given([{
                type: 'ReservationPlaced',
                data: {
                    reservation_id: '1232-ASD-123',
                    reservation_code: '12ZD3C',
                    email: 'hey@email.com',
                    day: '20206-10-12',
                    start_time: '11:00',
                    end_time: '13:00',
                    guests_number: 4,
                },
                metadata: {},
            }, {
                type: 'ReservationCancelledByGuest',
                data: {
                    reservation_id: '1232-ASD-123',
                },
                metadata: {},
            }])
            .when(command)
            .thenThrows();
    });
    (0, node_test_1.it)('spec: Cancel Reservation by Guest - Cancelling a non existing reservation fails', () => {
        const command = {
            type: 'CancelReservationByGuest',
            data: {
                reservation_id: 'non-existing',
            },
            metadata: {},
        };
        given([])
            .when(command)
            .thenThrows();
    });
});
