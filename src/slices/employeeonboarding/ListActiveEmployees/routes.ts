import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {getKnexInstance} from '../../../common/db';
import {ActiveEmployeesReadModel, tableName} from './ActiveEmployeesProjection';

export const api = (): WebApiSetup => (router: Router): void => {

    /**
     * @openapi
     * /api/query/listactiveemployees-collection:
     *   get:
     *     tags: [Employee Onboarding]
     *     summary: List Active Employees
     *     description: Lists every active employee with their name and role.
     *     parameters:
     *       - in: query
     *         name: _id
     *         required: false
     *         schema:
     *           type: string
     *         description: When set, returns the single row with this employee_id instead of the full collection
     *     responses:
     *       '200':
     *         description: The Active Employees read model
     *         content:
     *           application/json:
     *             schema:
     *               oneOf:
     *                 - $ref: '#/components/schemas/ActiveEmployeesReadModel'
     *                 - type: array
     *                   items:
     *                     $ref: '#/components/schemas/ActiveEmployeesReadModel'
     *       '500':
     *         description: Server error
     * components:
     *   schemas:
     *     ActiveEmployeesReadModel:
     *       type: object
     *       properties:
     *         employee_id:
     *           type: string
     *         employee_first_name:
     *           type: string
     *         employee_last_name:
     *           type: string
     *         employee_role:
     *           type: string
     */
    router.get('/api/query/listactiveemployees-collection', async (req: Request, res: Response) => {
        try {
            const db = getKnexInstance();
            const id = req.query._id?.toString();

            const data: ActiveEmployeesReadModel | ActiveEmployeesReadModel[] | undefined = id
                ? await db(tableName).withSchema('public').where({employee_id: id}).first()
                : await db(tableName).withSchema('public').select();

            return res.status(200).json(data ?? (id ? null : []));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ok: false, error: 'Server error'});
        }
    });
};
