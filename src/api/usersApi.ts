import { fetchWithTimeout } from "./authApi";

import { GET, POST, DELETE, PATCH, headersDefault, LOCALHOST } from "./authApi";

export interface Response {
    state: boolean
    message: string
    data: string[] | object
    limit?: number
    page?: number
    total?: number
    error?: string
}

export async function getUsers(token: string, page: number = 1, limit: number = 5, onlyUperators:boolean = false) {
    try {
        const onlyOperatorsQ = onlyUperators ? "&onlyOperators=true" : ""
        const headers = {
            ...headersDefault,
            Authorization: `Bearer ${token} `
        }
        const request = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/getUsers?page=${page}&limit=${limit}${onlyOperatorsQ}`,
            {
                method: GET,
                headers
            }
        );
        return request as Response;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: Response | any) {
        return error
    }
}

export async function createUser(data: object, token: string) {
    console.log(data)
    try {
        const headers = {
            ...headersDefault,
            Authorization: `Bearer ${token}`
        }
        const request = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/createUser`, {
            method: POST,
            body: JSON.stringify(data),
            headers
        })
        return request;

    } catch (error: Response | unknown) {
        return error
    }
}

export async function updateUser(userId: string, data: object, token: string) {
    try {
        const request = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/updateUser/${userId}`, {
            method: PATCH,
            body: JSON.stringify(data),
            headers: {
                ...headersDefault,
                Authorization: `Bearer ${token}`
            }
        })
        return request;
    } catch (error) {
        return error
    }
}
export async function getUserById(userId: string, token: string) {
    try {
        const request = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/getUserById/${userId}`, {
            method: GET,
            headers: {
                ...headersDefault,
                Authorization: `Bearer ${token}`
            }
        })
        return request;
    } catch (error) {
        return error
    }
}
export async function deleteUser(userId: string, token: string) {
    try {
        const req = await fetchWithTimeout(`${LOCALHOST}/api/user_routes/deleteUser/${userId}`, {
            method: DELETE,
            headers: {
                ...headersDefault,
                Authorization: `Bearer ${token}`
            }
        });
        return req;
    } catch (error) {
        return error;
    }
}