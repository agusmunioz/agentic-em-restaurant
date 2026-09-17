import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {RemoveTableCommand, handleRemoveTable} from './RemoveTableCommand';

export const api = (): WebApiSetup => (router: Router): void => {

    /**
     * @openapi
     * /api/removetable/{id}:
     *   post:
     *     tags: [Table Configuration]
     *     summary: Remove Table
     *     description: Removes an existing table by its table id.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The table_id of the table to remove
     *       - in: header
     *         name: correlation_id
     *         required: false
     *         schema:
     *           type: string
     *     responses:
     *       '201':
     *         description: Accepted — TableRemoved appended
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
     *         description: Unable to remove non existing table
     *       '500':
     *         description: Server error
     */
    router.post('/api/removetable/:id', async (req: Request, res: Response) => {
        const id = req.params.id;
        const correlationId = req.header('correlation_id');

        try {
            const command: RemoveTableCommand = {
                type: 'RemoveTable',
                data: {
                    table_id: id,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };

            const result = await handleRemoveTable(command);

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
        case 'table_not_found': return 'Unable to remove non existing table';
        default: return null;
    }
};
