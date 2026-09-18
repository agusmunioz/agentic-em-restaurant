import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {UpdateTableSeatsCommand, handleUpdateTableSeats} from './UpdateTableSeatsCommand';

export const api = (): WebApiSetup => (router: Router): void => {

    /**
     * @openapi
     * /api/updatetableseats/{id}:
     *   post:
     *     tags: [Table Configuration]
     *     summary: Update Table Seats
     *     description: Updates the seat count of an existing table.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The table_id of the table to update
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
     *             required: [seats]
     *             properties:
     *               seats:
     *                 type: integer
     *                 example: 6
     *     responses:
     *       '201':
     *         description: Accepted — TableSeatsUpdated appended
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
     *       '500':
     *         description: Server error
     */
    router.post('/api/updatetableseats/:id', async (req: Request, res: Response) => {
        const id = req.params.id;
        const correlationId = req.header('correlation_id');

        try {
            const command: UpdateTableSeatsCommand = {
                type: 'UpdateTableSeats',
                data: {
                    table_id: id,
                    seats: req.body.seats,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };

            const result = await handleUpdateTableSeats(command);

            if (correlationId) res.set('correlation_id', correlationId);

            return res.status(201).json({
                ok: true,
                next_expected_stream_version: result.nextExpectedStreamVersion?.toString(),
                last_event_global_position: result.lastEventGlobalPosition?.toString(),
            });
        } catch (err: any) {
            console.error(err);
            return res.status(500).json({ok: false, error: 'Server error'});
        }
    });
};
