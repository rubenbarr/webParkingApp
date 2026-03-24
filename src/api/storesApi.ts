import {
  fetchWithTimeout,
  GET,
  LOCALHOST,
  PATCH,
  POST,
  DELETE,
} from "./authApi";
import { headers } from "./locationApi";
import { Response } from "./usersApi";

export async function getStores(token: string, page: number, limit: number) {
  try {
    const req = await fetchWithTimeout(
      `${LOCALHOST}/api/stores_route/get_stores?page=${page}&limit=${limit}`,
      {
        method: GET,
        headers: headers(token),
      }
    );
    return req;
  } catch (error) {
    return error;
  }
}