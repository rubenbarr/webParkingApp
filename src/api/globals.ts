import { fetchWithTimeout, GET, LOCALHOST, PATCH, POST, DELETE  } from "./authApi";
import { headers } from "./locationApi";
import { Response } from "./usersApi";


export async function getTotalLocations(token:string){
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/indicators_route/getTotalLocations`, {
            method:GET,
            headers: headers(token)
        })
        return req as Response;
    } catch (error) {
        return error;
    }

}
export async function getTotalKiosk(token:string){
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/indicators_route/getTotalActiveKiosk`, {
            method:GET,
            headers: headers(token)
        })
        return req as Response;
    } catch (error) {
        return error;
    }

}

export async function getTotalUsers(token:string){
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/indicators_route/getTotalUsers`, {
            method: GET,
            headers: headers(token)
        })
        return req as Response;
    } catch(error) { return error}
}

export async function getTotalOperators(token:string){
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/indicators_route/getTotalOperators`, {
            method: GET,
            headers: headers(token)
        })
        return req as Response;
    } catch(error) { return error}
}