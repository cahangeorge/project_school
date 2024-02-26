import { createCookieSessionStorage, redirect } from "@remix-run/node"

// Store session secret from ENV
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set!")
}


// Store cookie
const storage_user_id = createCookieSessionStorage({
    cookie: {
        name: "userId",
        secure: process.env.NODE_ENV === "production",
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true
    }
})

const storage_user_type = createCookieSessionStorage({
    cookie: {
        name: "userType",
        secure: process.env.NODE_ENV === "production",
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true
    }
})


// Get the cookie
function getUserSessionId(request: Request) {
    return storage_user_id.getSession(request.headers.get("Cookie"))
}

function getUserSessionType(request: Request) {
    return storage_user_type.getSession(request.headers.get("Cookie"))
}


// Get user id from the cookie
export async function getUserCookieId(request: Request) {
    const session = await getUserSessionId(request)
    const userId = session.get("userId")

    if (!userId || typeof userId !== "string") {
        return null
    }

    return userId
}

export async function getUserCookieType(request: Request) {
    const session = await getUserSessionType(request)
    const userType = session.get("userType")

    if (!userType || typeof userType !== "string") {
        return null
    }

    return userType
}


// Redirect to login if user id is not stored in cookie
export async function requireUserId(
    request: Request,
    redirectTo: string = new URL(request.url).pathname
) {
    const session = await getUserSessionId(request)
    const userId = session.get("userId")

    if (!userId || typeof userId !== "string") {
        const searchParams = new URLSearchParams([
            ["redirectTo", redirectTo]
        ])

        throw redirect(`/login?${searchParams}`)
    }

    return userId
}

// Logout function
export async function logout(request: Request) {
    const session = await getUserSessionId(request)
    
    const cookie_user_id = await storage_user_id.destroySession(session)
    const cookie_user_type = await storage_user_type.destroySession(session)

    const headers = new Headers();
    headers.set("Set-Cookie", cookie_user_id);
    headers.set("Set-Cookie", cookie_user_type);

    return redirect("/login", {
        headers: headers
    })
}


// Store user id in cookie
export async function createUserSessionId(
    userId: string | undefined | null,
    redirectTo: string
) {
    try{

        const session_id = await storage_user_id.getSession()

        session_id.set("userId", userId)

        const cookie_user_id = await storage_user_id.commitSession(session_id)
        
        return redirect(redirectTo, {
            headers: {
                "Set-Cookie": cookie_user_id,
            }
        })
    } catch (error) {
        console.error("Error creating user session:", error);
        throw error; // Rethrow the error to handle it further up the call stack
    }
}

export async function createUserSessionType(
    userType: string | undefined | null,
    redirectTo: string
) {
    try{

        const session_type = await storage_user_type.getSession()

        session_type.set("userType", userType)

        const cookie_user_type = await storage_user_type.commitSession(session_type)
        
        return redirect(redirectTo, {
            headers: {
                "Set-Cookie": cookie_user_type,
            }
        })
    } catch (error) {
        console.error("Error creating user session:", error);
        throw error; // Rethrow the error to handle it further up the call stack
    }
}