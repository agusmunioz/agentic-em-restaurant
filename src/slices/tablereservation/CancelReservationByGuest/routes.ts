import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {CancelReservationByGuestCommand, handleCancelReservationByGuest} from './CancelReservationByGuestCommand';

export const api = (): WebApiSetup => (router: Router): void => {

    /**
     * @openapi
     * /api/cancelreservationbyguest/{id}:
     *   post:
     *     tags: [Table Reservation]
     *     summary: Cancel Reservation by Guest
     *     description: Cancels a guest's reservation by its reservation id.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The reservation_id of the reservation to cancel
     *       - in: header
     *         name: correlation_id
     *         required: false
     *         schema:
     *           type: string
     *     responses:
     *       '201':
     *         description: Accepted — ReservationCancelledByGuest appended
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 next_expected_stream_version:
     *                   type: string
     *                 last_event_global_position:
     *                   type: string
     *       '409':
     *         description: Cannot cancel a non existing reservation / Cancelling a canceled reservation is not allowed
     *       '500':
     *         description: Server error
     */
    router.post('/api/cancelreservationbyguest/:id', async (req: Request, res: Response) => {
        const id = req.params.id;
        const correlationId = req.header('correlation_id');

        try {
            const command: CancelReservationByGuestCommand = {
                type: 'CancelReservationByGuest',
                data: {
                    reservation_id: id,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };

            const result = await handleCancelReservationByGuest(command);

            if (correlationId) res.set('correlation_id', correlationId);

            return res.status(201).json({
                ok: true,
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
        case 'reservation_not_found': return 'Cannot cancel a non existing reservation';
        case 'reservation_already_cancelled': return 'Cancelling a canceled reservation is not allowed';
        default: return null;
    }
};
