import { createCookieSessionStorage, redirect } from "@remix-run/node"
import { db } from "./db.server"

// Store session secret from ENV
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set!")
}


// Store cookie
const storage = createCookieSessionStorage({
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
function getUserSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"))
}


// Get user id from the cookie
export async function getUserCookieForType(request: Request) {
    const session = await getUserSession(request)
    const userType = session.get("userType")

    if (!userType || typeof userType !== "string") {
        return null
    }

    return userType
}


// Redirect to login if user id is not stored in cookie
export async function requireuserType(
    request: Request,
    redirectTo: string = new URL(request.url).pathname
) {
    const session = await getUserSession(request)
    const userType = session.get("userType")

    if (!userType || typeof userType !== "string") {
        const searchParams = new URLSearchParams([
            ["redirectTo", redirectTo]
        ])

        throw redirect(`/login?${searchParams}`)
    }

    return userType
}


// Get user from DB
// export async function getUser(request: Request) {
//     const userType = await getuserType(request)

//     if (typeof userType !== "string") {
//         return null
//     }

//     const user = await db.user.findUnique({
//         select: { id: true, email: true },
//         where: { id: userType }
//     })

//     if (!user) {
//         throw logout(request)
//     }

//     return user
// }


// Logout function
export async function logout(request: Request) {
    const session = await getUserSession(request)
    console.log(session)

    return redirect("/login", {
        headers: {
            "Set-Cookie": await storage.destroySession(session)
        }
    })
}


// Store user id in cookie
export async function createUserSessionForType(
    userType: string | undefined | null,
    redirectTo: string
) {
    try{
        // const headers = new Headers();

        const session = await storage.getSession()

        session.set("userType", userType)

        const cookie = await storage.commitSession(session)

        // headers.set("Set-Cookie", cookie)
        
        // return redirect(redirectTo, {
        //     headers: {
        //         "Set-Cookie": cookie
        //     }
        // })
        return cookie
    } catch (error) {
        console.error("Error creating user session:", error);
        throw error; // Rethrow the error to handle it further up the call stack
    }
}
