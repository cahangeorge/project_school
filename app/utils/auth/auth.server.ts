import bcrypt from "bcryptjs"
import { db } from "../db.server"
import { type_user_list } from "../list.values"
import { createUser, getUser } from "./functions"

// Type for LoginForm
type Form = {
    name?: string,
    email: string,
    password: string,
    typeUser: string
}

// Type for Info account
type infoAccount = {
    userId?: string,
    typeUser?: string
}

// LoginForm function
export async function loginForm({
    typeUser, email, password
} : Form) {

    const user = await getUser({ email, typeUser, type_user_list }) // get the user

    if (typeof user === 'undefined') { // return status code 500 if something went wrong
        return {
            status: 500,
            message: 'Internal Server Error',
            data: null
        }
    }

    if (!user) { // return status code 401 if user not exist
        return {
            status: 401,
            message: 'User not exist',
            data: null
        }
    }

    const isCorrectPassword = await bcrypt.compare(
        password,
        user.password!
    ) // check if passwords are the same

    if (!isCorrectPassword) { // return status code 401 if passwords does not match
        return {
            status: 401,
            message: 'Passwords does not match!',
            data: null
        }
    }

    return { // return status code 200 if all is good
        status: 200,
        message: 'Success',
        data: user.id,
        type: type_user_list.admin
    }
}

// RegisterForm function
export async function registerForm({
    name, email, password, typeUser
} : Form) {

    const userExists = await getUser({ email, typeUser, type_user_list }) // check if user exists

    if (typeof userExists === 'undefined') { // return status code 500 if something went wrong
        return {
            status: 500,
            message: 'Internal Server Error',
            data: null
        }
    }

    if (userExists) { // if user exists return status code 400
        return {
            status: 400,
            message: 'User already exists!',
            data: null
        }
    }

    const user = await createUser({ name, email, password, typeUser, type_user_list }) // create the user

    if (typeof user === 'undefined') { // return status code 500 if something went wrong
        return {
            status: 500,
            message: 'Internal Server Error',
            data: null
        }
    }

    return { // return status code 201 or 500, depends the result of user const
        status: user ? 201 : 500,
        message: user ? 'Success' : 'Internal Server Error',
        data: user?.id
    }

}

// Information account function
export async function infoAccount({
    userId, typeUser
} : infoAccount) {
    
    const id = userId

    const user = await getUser({ id, typeUser, type_user_list }) // get the user

    if (typeof user === 'undefined') { // return status code 500 if something went wrong
        return {
            status: 500,
            message: 'Internal Server Error',
            data: null
        }
    }

    if (!user) { // return status code 401 if user not exist
        return {
            status: 404,
            message: 'User not exist',
            data: null
        }
    }

    return { // return status code 200 if all is good
        status: 200,
        message: 'Success',
        data: user
    }

}