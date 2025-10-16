import { fetchWithTimeout, GET, LOCALHOST, PATCH, POST, DELETE} from "./authApi";
import { headers } from "./locationApi";
import { Response } from "./usersApi";



export async function getKioscos(token:string, page:number, limit:number = 5, notAssigned :boolean = false) {
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/kiosco_routes/getKioscos?page=${page}&limit=${limit}&notAssigned=${notAssigned}`, {
            method:GET,
            headers: headers(token)
        });
        return req as Response;
    } catch (error) {
        return error;
    }
}
export async function createKiosco(token:string, data:object) {
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/kiosco_routes/createKiosco`, {
            method:POST,
            headers: headers(token),
            body:JSON.stringify(data)
        });
        return req as Response;
    } catch (error) {
        return error;
    }
}
export async function updateKioscoById(token:string, data:object, kioscoId:string) {
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/kiosco_routes/updateKiosco/${kioscoId}`, {
            method:PATCH,
            headers: headers(token),
            body:JSON.stringify(data)
        });
        return req as Response;
    } catch (error) {
        return error;
    }
}

export async function getKioscoMoneyData(token:string, kioscoId:string) {
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/kiosco_routes/getKioscoData/${kioscoId}`, {
            method:GET,
            headers: headers(token)
        });
        return req as Response;
    } catch (error) {
        return error;
    }
}
export async function getKioscoById(token:string, kioscoId:string) {
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/kiosco_routes/getKioscoById/${kioscoId}`, {
            method:GET,
            headers: headers(token)
        });
        return req as Response;
    } catch (error) {
        return error;
    }
}
export async function deleteKioscoById(token:string, kioscoId:string) {
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/kiosco_routes/deleteKiosco/${kioscoId}`, {
            method:DELETE,
            headers: headers(token)
        });
        return req as Response;
    } catch (error) {
        return error;
    }
}




