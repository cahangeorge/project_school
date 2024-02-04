import { db } from "../db.server"
import bcrypt from "bcryptjs"

// Type for user
type TypeUser = {
    id? :string,
    name?: string,
    email?: string,
    password?: string,
    typeUser?: string,
    type_user_list?: {
        student: string,
        parent: string,
        teacher: string,
        admin_institution: string,
        admin: string
    }
}

// Function to get the user
export async function getUser({
    id, email, typeUser, type_user_list
} : TypeUser) {

    if (( !id && !email ) || !typeUser || !type_user_list) { // return null if parameters are not completed
        return null
    }

    let user = null
    
    if (typeUser === type_user_list.student) { // if user is a student search him on table Student

        user = await db.student.findUnique({
            where: { id, email }
        })

    } else if (typeUser === type_user_list.parent) { // if user is a parent search him on table Parent

        user = await db.parent.findUnique({
            where: { id, email }
        })

    } else if (typeUser === type_user_list.teacher) { // if user is a teacher search him on table teacher

        user = await db.teacher.findUnique({
            where: { id, email }
        })

    } else if (typeUser === type_user_list.admin_institution) { // if user is an admin institution search him on table AdminInstitution

        user = await db.adminInstitution.findUnique({
            where: { id, email }
        })

    } else if (typeUser === type_user_list.admin) { // if user is and admin search him on table Admin
        user = await db.admin.findUnique({
            where: { id, email }
        })
    }
    
    return user
}

// Function to create user
export async function createUser({
    name, email, password, typeUser, type_user_list
} : TypeUser) {

    if (!name || !email || !password || !typeUser || !type_user_list) { // return null if parameters are not completed
        return undefined
    }

    let user = null

    password = await bcrypt.hash(password, 10) // hash the password
    
    
    if (typeUser === type_user_list.student) { // if user is a student create a row in table Student

        user = await db.student.create({
            data: { name, email, password }
        })

    } else if (typeUser === type_user_list.parent) { // if user is a parent create a row in table Parent

        user = await db.parent.create({
            data: { name, email, password }
        })

    } else if (typeUser === type_user_list.teacher) { // if user is a teacher create a row in table Teacher

        user = await db.teacher.create({
            data: { name, email, password }
        })

    } else if (typeUser === type_user_list.admin_institution) { // if user is an admin institution create a row in table AdminInstitution

        user = await db.adminInstitution.create({
            data: { name, email, password }
        })

    } else if (typeUser === type_user_list.admin) { // if user is an admin create a row in table Admin
        user = await db.admin.create({
            data: { name, email, password }
        })
    }
    
    return user
}