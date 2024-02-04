import { db } from "../db.server"
import bcrypt from "bcryptjs"
import { message_list, type_user_list } from "../list.values"
import { check_type_user } from "../functions"

// Type Create Admin
type createAdmin = {
    name: string,
    email: string,
    password: string,
    typeUser: string
}

// Type Read Admin
type ReadAdmin = {
    id: string | null,
    typeUser: string
}

// Type Update Admin
type UpdateAdmin = {
    id: string | null,
    name: string,
    email: string,
    oldPassword: string | null,
    newPassword: string | null,
    typeUser: string
}

// Create an Admin
export async function createAdmin({
    name, email, password, typeUser
} : createAdmin) {

    check_type_user(typeUser, [type_user_list.admin])

    const adminExists = await db.admin.findUnique({
        where: { email }
    })

    if (adminExists) {
        return {
            status: 400,
            message: 'Admin already exists!',
            data: null
        }
    }

    password = await bcrypt.hash(password, 10)

    const admin = await db.admin.create({
        data: { name, email, password }
    })

    return {
        status: 201,
        message: 'Success',
        data: admin.id
    }

}

// Get Admin
export async function readAdmin({
    id, typeUser
} : ReadAdmin) {

    check_type_user(typeUser, [type_user_list.admin])

    let admin = null

    if (id) {

        admin = await db.admin.findUnique({
            where: { id }
        })

    } else {

        admin = await db.admin.findMany()

    }

    return {
        status: 200,
        message: message_list.success,
        data: admin
    }

}

// Update Admin
export async function updateAdmin({
    id, name, email, oldPassword, newPassword, typeUser
} : UpdateAdmin) {

    check_type_user(typeUser, [type_user_list.admin])

    if (!id) {
        return {
            status: 400,
            message: message_list.went_wrong,
            data: null
        }
    }

    const admin = await db.admin.findUnique({
        where: { id }
    })

    if (!admin) {
        return {
            status: 400,
            message: message_list.went_wrong,
            data: null
        }
    }

    const adminUpdated = await db.admin.update({
        where: { id },
        data: { name, email }   
    })

    if (oldPassword && newPassword) {

        const isCorrectPassword = await bcrypt.compare( // Compare passwords
            oldPassword,
            admin.password
        );

        if (isCorrectPassword) {
            const password = newPassword

            const adminUpdatedWithPassword = await db.admin.update({
                where: { id },
                data: { password }   
            })
        }

    }

    return {
        status: 200,
        message: message_list.success,
        data: null
    }

}