import {Request, Response, Router} from 'express';
import {WebApiSetup} from '@event-driven-io/emmett-expressjs';
import {getKnexInstance} from '../../../common/db';
import {GuestActiveReservationsReadModel, tableName} from './GuestActiveReservationsProjection';

export const api = (): WebApiSetup => (router: Router): void => {

    /**
     * @openapi
     * /api/query/guestactivereservations-collection:
     *   get:
     *     tags: [Table Reservation]
     *     summary: Guest Active Reservations
     *     description: Lists the guest's active reservations, removed once cancelled by the guest.
     *     parameters:
     *       - in: query
     *         name: _id
     *         required: false
     *         schema:
     *           type: string
     *         description: When set, returns the single row with this reservation_id instead of the full collection
     *       - in: query
     *         name: email
     *         required: false
     *         schema:
     *           type: string
     *         description: When set (and _id is not), returns only the reservations for this guest email
     *     responses:
     *       '200':
     *         description: The Guest Active Reservations read model
     *         content:
     *           application/json:
     *             schema:
     *               oneOf:
     *                 - $ref: '#/components/schemas/GuestActiveReservationsReadModel'
     *                 - type: array
     *                   items:
     *                     $ref: '#/components/schemas/GuestActiveReservationsReadModel'
     *       '500':
     *         description: Server error
     * components:
     *   schemas:
     *     GuestActiveReservationsReadModel:
     *       type: object
     *       properties:
     *         reservation_id:
     *           type: string
     *           format: uuid
     *         reservation_code:
     *           type: string
     *           example: 12ZD3C
     *         day:
     *           type: string
     *           format: date
     *           example: "20206-10-12"
     *         start_time:
     *           type: string
     *           example: "11:00"
     *         end_time:
     *           type: string
     *           example: "13:00"
     *         guests_number:
     *           type: integer
     *           example: 4
     *         email:
     *           type: string
     */
    router.get('/api/query/guestactivereservations-collection', async (req: Request, res: Response) => {
        try {
            const db = getKnexInstance();
            const id = req.query._id?.toString();
            const email = req.query.email?.toString();

            const data: GuestActiveReservationsReadModel | GuestActiveReservationsReadModel[] | undefined = id
                ? await db(tableName).withSchema('public').where({reservation_id: id}).first()
                : email
                    ? await db(tableName).withSchema('public').where({email}).select()
                    : await db(tableName).withSchema('public').select();

            return res.status(200).json(data ?? (id ? null : []));
        } catch (err) {
            console.error(err);
            return res.status(500).json({ok: false, error: 'Server error'});
        }
    });
};
