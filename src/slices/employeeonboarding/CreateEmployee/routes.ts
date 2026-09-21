import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {CreateEmployeeCommand, handleCreateEmployee} from './CreateEmployeeCommand';

export const api = (): WebApiSetup => (router: Router): void => {

    /**
     * @openapi
     * /api/createemployee:
     *   post:
     *     tags: [Employee Onboarding]
     *     summary: Create Employee
     *     description: Creates a new employee record with basic information.
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
     *             required: [employee_first_name, employee_last_name, employee_role]
     *             properties:
     *               employee_first_name:
     *                 type: string
     *                 example: Tom
     *               employee_last_name:
     *                 type: string
     *                 example: Becker
     *               employee_role:
     *                 type: string
     *                 example: cooker
     *     responses:
     *       '201':
     *         description: Accepted — EmployeeCreated appended
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                 employee_id:
     *                   type: string
     *                 next_expected_stream_version:
     *                   type: string
     *                 last_event_global_position:
     *                   type: string
     *       '409':
     *         description: First name is required
     *       '500':
     *         description: Server error
     */
    router.post('/api/createemployee', async (req: Request, res: Response) => {
        const correlationId = req.header('correlation_id');

        try {
            const command: CreateEmployeeCommand = {
                type: 'CreateEmployee',
                data: {
                    employee_first_name: req.body.employee_first_name,
                    employee_last_name: req.body.employee_last_name,
                    employee_role: req.body.employee_role,
                },
                metadata: {
                    correlation_id: correlationId,
                },
            };

            const result = await handleCreateEmployee(command);
            const employeeCreated = result.newEvents[0];

            if (correlationId) res.set('correlation_id', correlationId);

            return res.status(201).json({
                ok: true,
                employee_id: employeeCreated.data.employee_id,
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
        case 'first_name_required': return 'First name is required';
        default: return null;
    }
};
