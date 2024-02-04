import { db } from "~/utils/db.server"
import { check_admin_institution_exist, check_type_user } from "~/utils/functions"
import { message_list, type_user_list } from "~/utils/list.values"
import { check_user_exist } from "./functions"
import { CheckAuth } from "~/utils/types.list"

// Type Create Class
type CreateClass = {
    institutionId: string,
    number: string,
    letter: string
}

// Function Create Class
export async function createClass(
    { typeUser, adminInstitutionId } : CheckAuth,
    { number, letter } : CreateClass
) {

    check_type_user(typeUser, [
        type_user_list.admin,
        type_user_list.admin_institution
    ])

    if (!adminInstitutionId) {
        return {
            status: 400,
            message: message_list.went_wrong,
            data: null
        }
    }

    const adminExists = await check_admin_institution_exist(adminInstitutionId, true)

    if (!adminExists.data?.institution?.id) {
        return {
            status: 400,
            message: 'Admin already exists!',
            data: null
        }
    }

    const institutionId = adminExists.data.institution.id

    const classCreated = await db.class.create({
        data: { institutionId, number, letter }
    })

    return {
        status: 201,
        message: 'Success',
        data: null
    }

}

// Function Read Class
export async function readClass(
    { adminId, adminInstitutionId, typeUser, classId } : CheckAuth
) {

    check_type_user(typeUser, [
        type_user_list.admin,
        type_user_list.admin_institution,
        type_user_list.teacher
    ])

    if (!adminInstitutionId) {
        return {
            status: 400,
            message: message_list.went_wrong,
            data: null
        }
    }

    const adminExists = await check_user_exist(adminId, adminInstitutionId, false)

    if (!adminExists) {
        return {
            status: 400,
            message: message_list.admin_exists,
            data: null
        }
    }
    
    let getClass = null

    if (classId) {

        const id = classId

        getClass = await db.class.findUnique({
            where: { id }
        })

    } else {

        getClass = await db.class.findMany()

    }

    return {
        status: 200,
        message: message_list.success,
        data: getClass
    }

}

// Function Update Class
export async function UpdateClass(
    { adminId, typeUser, adminInstitutionId, teacherId, classId } : CheckAuth,
    { institutionId, number, letter } : CreateClass
) {

    check_type_user(typeUser, [
        type_user_list.admin,
        type_user_list.admin_institution,
        type_user_list.teacher
    ])

    if (!classId) {
        return {
            status: 400,
            message: message_list.went_wrong,
            data: null
        }
    }

    const id = classId

    const classUpdated = await db.class.update({
        where: { id },
        data: { institutionId, number, letter }
    })

    return {
        status: 201,
        message: message_list.success,
        data: null
    }

}