import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {AddTableCommand, handleAddTable} from './AddTableCommand';

export const api = (): WebApiSetup => (router: Router): void => {

    /**
     * @openapi
     * /api/addtable:
     *   post:
     *     tags: [Table Configuration]
     *     summary: Add Table
     *     description: Adds a new table with a unique table number and seat count.
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
     *             required: [table_number, seats]
     *             properties:
     *               table_number:
     *                 type: integer
     *                 example: 1
     *               seats:
     *                 type: integer
     *                 example: 4
     *     responses:
     *       '201':
     *         description: Accepted — TableAdded appended
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 table_id:
     *                   type: string
     *                 next_expected_stream_version:
     *                   type: string
     *                 last_event_global_position:
     *                   type: string
     *       '409':
     *         description: A table with the same number already exists, or seats is not bigger than zero
     *       '500':
     *         description: Server error
     */
    router.post('/api/addtable', async (req: Request, res: Response) => {
        const correlationId = req.header('correlation_id');

        try {
            const command: AddTableCommand = {
                type: 'AddTable',
                data: {
                    table_number: req.body.table_number,
                    seats: req.body.seats,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };

            const result = await handleAddTable(command);
            const tableAdded = result.newEvents[0];

            if (correlationId) res.set('correlation_id', correlationId);

            return res.status(201).json({
                ok: true,
                table_id: tableAdded.data.table_id,
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
        case 'table_number_not_unique': return 'A table with the same number already exists';
        case 'seats_not_positive': return 'Seats must be bigger than zero';
        default: return null;
    }
};
