import {DeciderSpecification} from '@event-driven-io/emmett';
import {
    CancelReservationByGuestCommand,
    CancelReservationByGuestInitialState,
    decide,
    evolve,
} from './CancelReservationByGuestCommand';
import {describe, it} from 'node:test';

describe('Cancel Reservation by Guest Specification', () => {
    const given = DeciderSpecification.for({
        decide,
        evolve,
        initialState: CancelReservationByGuestInitialState,
    });

    it('spec: Cancel Reservation by Guest - Successfully cancel a reservation', () => {
        const command: CancelReservationByGuestCommand = {
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

    it('spec: Cancel Reservation by Guest - Cancelling a cancelled reservation fails', () => {
        const command: CancelReservationByGuestCommand = {
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

    it('spec: Cancel Reservation by Guest - Cancelling a non existing reservation fails', () => {
        const command: CancelReservationByGuestCommand = {
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
