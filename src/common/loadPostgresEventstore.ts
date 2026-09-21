import {getPostgreSQLEventStore} from "@event-driven-io/emmett-postgresql";
import {projections} from "@event-driven-io/emmett";
import {postgresUrl, getSharedPool} from "./db";
import {ListTablesProjection} from "../slices/tableconfiguration/ListTables/ListTablesProjection";
import {GuestActiveReservationsProjection} from "../slices/tablereservation/GuestActiveReservations/GuestActiveReservationsProjection";
import {ActiveEmployeesProjection} from "../slices/employeeonboarding/ListActiveEmployees/ActiveEmployeesProjection";
import {ReservationDayIndexProjection} from "../slices/tablereservation/CancelReservationByGuest/ReservationDayIndexProjection";

let eventStoreInstance: ReturnType<typeof getPostgreSQLEventStore> | null = null;

export const findEventstore = async () => {
    if (!eventStoreInstance) {
        eventStoreInstance = getPostgreSQLEventStore(postgresUrl, {
            schema: {
                autoMigration: "CreateOrUpdate"
            },
            connectionOptions: {
                pooled: true,
                pool: getSharedPool(),
            },
            projections: projections.inline([
                ListTablesProjection,
                GuestActiveReservationsProjection,
                ActiveEmployeesProjection,
                ReservationDayIndexProjection,
            ]),
        });
        await eventStoreInstance.schema.migrate();
    }
    return eventStoreInstance;
};
