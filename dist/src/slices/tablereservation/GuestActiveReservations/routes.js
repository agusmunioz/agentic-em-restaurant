"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const db_1 = require("../../../common/db");
const GuestActiveReservationsProjection_1 = require("./GuestActiveReservationsProjection");
const api = () => (router) => {
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
    router.get('/api/query/guestactivereservations-collection', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const db = (0, db_1.getKnexInstance)();
            const id = (_a = req.query._id) === null || _a === void 0 ? void 0 : _a.toString();
            const email = (_b = req.query.email) === null || _b === void 0 ? void 0 : _b.toString();
            const data = id
                ? yield db(GuestActiveReservationsProjection_1.tableName).withSchema('public').where({ reservation_id: id }).first()
                : email
                    ? yield db(GuestActiveReservationsProjection_1.tableName).withSchema('public').where({ email }).select()
                    : yield db(GuestActiveReservationsProjection_1.tableName).withSchema('public').select();
            return res.status(200).json(data !== null && data !== void 0 ? data : (id ? null : []));
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ ok: false, error: 'Server error' });
        }
    }));
};
exports.api = api;
