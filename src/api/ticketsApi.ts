/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchWithTimeout, GET, LOCALHOST, PATCH, POST, DELETE} from "./authApi";
import { headers } from "./locationApi";

export async function getTicketInfoById(token:string, ticketId:string, locationId:string) {
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/ticketRoute/checkTicket/${ticketId}`, {
            method:POST,
            headers: {...headers(token), locationId, external:true as any }
        });
        return req;
    } catch (error) {
        return error;
    }
}