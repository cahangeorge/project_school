import { json } from "@remix-run/node";

export const receiveRequest = <T>(data: T, statusCode: number) => json<T>(
    data,
    { status: statusCode }
)