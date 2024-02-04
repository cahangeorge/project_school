import { check_admin_institution_exist, check_type_user, check_user_exist } from "~/utils/functions"
import { message_list, type_user_list } from "~/utils/list.values"
import { db } from "~/utils/db.server"
import { CheckAuth } from "~/utils/types.list"
import bcrypt from "bcryptjs"

type Teacher = {
    name: string,
    email: string,
    password: string,
    courseId: string,
    classId: string,
    institutionId: string
}

export async function createTeacher(
    { typeUser, adminInstitutionId } : CheckAuth,
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

    const adminId = null

    const adminExists = await check_admin_institution_exist(adminInstitutionId, true)

    if (!adminExists.data?.institution?.id) {
        return {
            status: 400,
            message: message_list.access_rights,
            data: null
        }
    }

    const institutionId = adminExists.data.institution?.id
    const classId = ""
    const courseId = ""

    const teacher = await db.teacher.create({
        data: { institutionId, classId, courseId }
    })

    return {
        status: 200,
        message: message_list.success,
        data: null
    }

}

export async function readTeacher(
    { adminId, typeUser, adminInstitutionId, teacherId } : CheckAuth
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

    let getTeacher = null

    if (teacherId) {
        
        const id = teacherId

        getTeacher = await db.teacher.findUnique({
            where: { id }
        })

    } else {

        getTeacher = await db.teacher.findMany()

    }

    return {
        status: 200,
        message: message_list.success,
        data: getTeacher
    }

}

export async function UpdateTeacher(
    { adminId, typeUser, adminInstitutionId, teacherId } : CheckAuth,
    { name, email, password, courseId, classId, institutionId } : Teacher
) {

    check_type_user(typeUser, [type_user_list.admin, type_user_list.admin_institution, type_user_list.teacher])

    const id = teacherId

    if (!id) {
        return {
            status: 400,
            message: message_list.went_wrong,
            data: null
        }
    }

    const adminExists = await db.teacher.findUnique({
        where: { id }
    })

    if (!adminExists) {
        return {
            status: 400,
            message: message_list.admin_exists,
            data: null
        }
    }

    password = await bcrypt.hash(password, 10)

    const teacherUpdated = await db.teacher.update({
        where: { id },
        data: { name, email, password, courseId, classId, institutionId  }
    })

    return {
        status: 201,
        message: message_list.success,
        data: null
    }

}