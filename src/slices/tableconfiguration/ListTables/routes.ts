import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {getKnexInstance} from '../../../common/db';
import {TablesReadModel, tableName} from './ListTablesProjection';

export const api = (): WebApiSetup => (router: Router): void => {

    /**
     * @openapi
     * /api/query/listtables-collection:
     *   get:
     *     tags: [Table Configuration]
     *     summary: List Tables
     *     description: Lists every configured table with its table number and seat count.
     *     parameters:
     *       - in: query
     *         name: _id
     *         required: false
     *         schema:
     *           type: string
     *         description: When set, returns the single row with this table_id instead of the full collection
     *     responses:
     *       '200':
     *         description: The Tables read model
     *         content:
     *           application/json:
     *             schema:
     *               oneOf:
     *                 - $ref: '#/components/schemas/TablesReadModel'
     *                 - type: array
     *                   items:
     *                     $ref: '#/components/schemas/TablesReadModel'
     *       '500':
     *         description: Server error
     * components:
     *   schemas:
     *     TablesReadModel:
     *       type: object
     *       properties:
     *         table_id:
     *           type: string
     *         table_number:
     *           type: integer
     *         seats:
     *           type: integer
     */
    router.get('/api/query/listtables-collection', async (req: Request, res: Response) => {
        try {
            const db = getKnexInstance();
            const id = req.query._id?.toString();

            const data: TablesReadModel | TablesReadModel[] | undefined = id
                ? await db(tableName).withSchema('public').where({table_id: id}).first()
                : await db(tableName).withSchema('public').select();

            return res.status(200).json(data ?? (id ? null : []));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ok: false, error: 'Server error'});
        }
    });
};
