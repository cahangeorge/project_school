// import { createCookieSessionStorage, redirect } from "@remix-run/node"
// import { db } from "./db.server"

// // Store session secret from ENV
// const sessionSecret = process.env.SESSION_SECRET
// if (!sessionSecret) {
//     throw new Error("SESSION_SECRET must be set!")
// }


// // Store cookie
// const storage = (
//     names: string[]
// ) => {

//     let storage: any = {}

//     names.forEach ((item) => {
//         const session = createCookieSessionStorage({
//             cookie: {
//                 name: item,
//                 secure: process.env.NODE_ENV === "production",
//                 secrets: [sessionSecret],
//                 sameSite: "lax",
//                 path: "/",
//                 maxAge: 60 * 60 * 24 * 30,
//                 httpOnly: true
//             }
//         })

//         storage[item] = session
//     })

//     return storage
// }

// // Get the cookie
// async function getUserSession(request: Request) {
//     const getStorage = storage(["userId", "typeUser"])
      
//     for (const key in getStorage) {
//         getStorage[key] = await getStorage[key].getSession(request.headers.get("Cookie"))
//     }
      

//     return getStorage
// }


// // Get user id from the cookie
// export async function getUserCookie(request: Request) {
//     const session = await getUserSession(request)

//     // console.log(session.userId)

//     const userId = session.userId.get("userId")
//     const typeUser = session.typeUser.get("typeUser")

//     if (!userId || typeof userId !== "string") {
//         return null
//     }

//     return {
//         userId: userId,
//         typeUser: typeUser
//     }
// }


// // Redirect to login if user id is not stored in cookie
// export async function requireUserId(
//     request: Request,
//     redirectTo: string = new URL(request.url).pathname
// ) {
//     const session = await getUserSession(request)
//     const userId = session.get("userId")

//     if (!userId || typeof userId !== "string") {
//         const searchParams = new URLSearchParams([
//             ["redirectTo", redirectTo]
//         ])

//         throw redirect(`/login?${searchParams}`)
//     }

//     return userId
// }


// // // Get user from DB
// // export async function getUser(request: Request) {
// //     const userId = await getUserId(request)

// //     if (typeof userId !== "string") {
// //         return null
// //     }

// //     const user = await db.user.findUnique({
// //         select: { id: true, email: true },
// //         where: { id: userId }
// //     })

// //     if (!user) {
// //         throw logout(request)
// //     }

// //     return user
// // }


// // Logout function
// // export async function logout(request: Request) {
// //     const session = await getUserSession(request)
// //     console.log(session)

// //     return redirect("/login", {
// //         headers: {
// //             "Set-Cookie": await storage.destroySession(session)
// //         }
// //     })
// // }


// // Store user id in cookie
// export async function createUserSession(
//     values: string[],
//     redirectTo: string
// ) {
//     try{

//         const getStorage = storage(values)

//         // getStorage.forEach(async (item: any) => {
//         //     const session = await item.getSession()

//         //     session.set()
//         // })
//         let i = 0
//         for (const key in getStorage) {
//             const session = await getStorage[key].getSession()

//             session.set(key, values[i])

//             const cookie = await getStorage.commitSession(session)

//             i++
//         }

//         // session.set("userId", userId)
//         // session.set("typeUser", typeUser)

//         // const cookie = await getStorage.commitSession(session)
        
//         // return redirect(redirectTo, {
//         //     headers: {
//         //         "Set-Cookie": cookie
//         //     }
//         // })
//     } catch (error) {
//         console.error("Error creating user session:", error);
//         throw error; // Rethrow the error to handle it further up the call stack
//     }
// }
