import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {DeleteEmployeeCommand, handleDeleteEmployee} from './DeleteEmployeeCommand';

export const api = (): WebApiSetup => (router: Router): void => {

    /**
     * @openapi
     * /api/deleteemployee/{id}:
     *   post:
     *     tags: [Employee Onboarding]
     *     summary: Delete Employee
     *     description: Deletes an existing employee by its employee id.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The employee_id of the employee to delete
     *       - in: header
     *         name: correlation_id
     *         required: false
     *         schema:
     *           type: string
     *     responses:
     *       '201':
     *         description: Accepted — EmployeeDeleted appended
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
     *         description: employee_id is required, or the employee has already been deleted
     *       '500':
     *         description: Server error
     */
    router.post('/api/deleteemployee/:id', async (req: Request, res: Response) => {
        const id = req.params.id;
        const correlationId = req.header('correlation_id');

        try {
            const command: DeleteEmployeeCommand = {
                type: 'DeleteEmployee',
                data: {
                    employee_id: id,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };

            const result = await handleDeleteEmployee(command);

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
        case 'employee_id_required': return 'employee_id is required';
        case 'employee_not_found': return 'Employee has already been deleted';
        default: return null;
    }
};
