import { json } from "@remix-run/node";

export const receiveRequest = <T>(data: T, statusCode: number) => json<T>(
    data,
    { status: statusCode }
)

// 1xx Informational:

    // 100 Continue: The initial part of the request has been received, and the client should continue with its request.

    // 101 Switching Protocols: The server is changing protocols, for example, switching from HTTP to HTTPS.

// 2xx Success:

    // 200 OK: The request was successful, and the server has returned the requested data.

    // 201 Created: The request was successful, and a new resource was created as a result.

    // 204 No Content: The server successfully processed the request, but there is no content to send in the response.

// 3xx Redirection:

    // 301 Moved Permanently: The requested resource has been permanently moved to a new location.

    // 302 Found (or 307 Temporary Redirect): The requested resource has been temporarily moved to another location.

    // 304 Not Modified: The client's cached copy is still valid, and there is no need to transfer the requested resource again.

// 4xx Client Errors:

    // 400 Bad Request: The server cannot understand the request due to a client error.

    // 401 Unauthorized: The request requires user authentication.

    // 403 Forbidden: The server understood the request, but the server refuses to authorize it.

    // 404 Not Found: The requested resource could not be found on the server.

// 5xx Server Errors:

    // 500 Internal Server Error: A generic error message indicating that the server has encountered a situation it doesn't know how to handle.

    // 501 Not Implemented: The server does not support the functionality required to fulfill the request.

    // 503 Service Unavailable: The server is not ready to handle the request. Common causes are a server that is down for maintenance or is overloaded.