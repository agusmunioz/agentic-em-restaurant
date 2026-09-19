import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {PlaceReservationCommand, handlePlaceReservation} from './PlaceReservationCommand';

export const api = (): WebApiSetup => (router: Router): void => {

    /**
     * @openapi
     * /api/placereservation:
     *   post:
     *     tags: [Table Reservation]
     *     summary: Place Reservation
     *     description: Places a table reservation for a guest on a given day and time range.
     *     parameters:
     *       - in: header
     *         name: correlation_id
     *         required: false
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [email, day, start_time, end_time, guests_number]
     *             properties:
     *               email:
     *                 type: string
     *                 example: hey@email.com
     *               day:
     *                 type: string
     *                 format: date
     *                 example: "20206-10-12"
     *               start_time:
     *                 type: string
     *                 example: "11:00"
     *               end_time:
     *                 type: string
     *                 example: "13:00"
     *               guests_number:
     *                 type: integer
     *                 example: 4
     *     responses:
     *       '201':
     *         description: Accepted — ReservationPlaced appended
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 reservation_id:
     *                   type: string
     *                 reservation_code:
     *                   type: string
     *                 next_expected_stream_version:
     *                   type: string
     *                 last_event_global_position:
     *                   type: string
     *       '409':
     *         description: Guest number must be positive / Start time cannot be after end time / A reservation in the past is not allowed / Table is already reserved at the moment
     *       '500':
     *         description: Server error
     */
    router.post('/api/placereservation', async (req: Request, res: Response) => {
        const correlationId = req.header('correlation_id');

        try {
            const command: PlaceReservationCommand = {
                type: 'PlaceReservation',
                data: {
                    email: req.body.email,
                    day: req.body.day,
                    start_time: req.body.start_time,
                    end_time: req.body.end_time,
                    guests_number: req.body.guests_number,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };

            const result = await handlePlaceReservation(command);
            const emittedEvent = result.newEvents[0];
            if (emittedEvent.type !== 'ReservationPlaced') {
                throw new Error(`Unexpected event type: ${emittedEvent.type}`);
            }
            const reservationPlaced = emittedEvent;

            if (correlationId) res.set('correlation_id', correlationId);

            return res.status(201).json({
                ok: true,
                reservation_id: reservationPlaced.data.reservation_id,
                reservation_code: reservationPlaced.data.reservation_code,
                next_expected_stream_version: result.nextExpectedStreamVersion?.toString(),
                last_event_global_position: result.lastEventGlobalPosition?.toString(),
            });
        } catch (err: any) {
            const errorMessage = errorMapping(err?.code);
            if (errorMessage) {
                return res.status(409).json({error: errorMessage});
            }
            console.error(err);
            return res.status(500).json({ok: false, error: 'Server error'});
        }
    });
};

const errorMapping = (code: string): string | null => {
    switch (code) {
        case 'guests_number_not_positive': return 'Guest number must be positive';
        case 'invalid_time_range': return 'Start time cannot be after end time';
        case 'reservation_in_the_past': return 'A reservation in the past is not allowed';
        case 'reservation_overlap': return 'Table is already reserved at the moment';
        default: return null;
    }
};
