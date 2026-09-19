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
exports.findEventstore = void 0;
const emmett_postgresql_1 = require("@event-driven-io/emmett-postgresql");
const emmett_1 = require("@event-driven-io/emmett");
const db_1 = require("./db");
const ListTablesProjection_1 = require("../slices/tableconfiguration/ListTables/ListTablesProjection");
const GuestActiveReservationsProjection_1 = require("../slices/tablereservation/GuestActiveReservations/GuestActiveReservationsProjection");
let eventStoreInstance = null;
const findEventstore = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!eventStoreInstance) {
        eventStoreInstance = (0, emmett_postgresql_1.getPostgreSQLEventStore)(db_1.postgresUrl, {
            schema: {
                autoMigration: "CreateOrUpdate"
            },
            connectionOptions: {
                pooled: true,
                pool: (0, db_1.getSharedPool)(),
            },
            projections: emmett_1.projections.inline([
                ListTablesProjection_1.ListTablesProjection,
                GuestActiveReservationsProjection_1.GuestActiveReservationsProjection,
            ]),
        });
        yield eventStoreInstance.schema.migrate();
    }
    return eventStoreInstance;
});
exports.findEventstore = findEventstore;
