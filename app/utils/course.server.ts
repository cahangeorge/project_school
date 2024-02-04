import { db } from "./db.server";
import { check_admin_institution_exist, check_type_user, check_user_exist } from "./functions";
import { message_list, type_user_list } from "./list.values";
import { CheckAuth } from "./types.list";

type CreateCourse = {
    institutionId: string,
    name: string
}

type UpdateCourse = {
    institutionId: string,
    classId: string,
    testId: string,
    name: string
}

export async function createCourse(
    { typeUser, adminInstitutionId } : CheckAuth,
    { name } : CreateCourse
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
            message: message_list.admin_exists,
            data: null
        }
    }

    const institutionId = adminExists.data.institution.id
    const classId = ""
    const testId = ""

    const course = await db.course.create({
        data: { institutionId, name, classId, testId }
    })

    return {
        status: 200,
        message: message_list.success,
        data: null
    }

}

export async function readCourse(
    { adminId, typeUser, adminInstitutionId, teacherId, courseId } : CheckAuth
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

    let getCourse = null

    if (courseId) {

        const id = courseId

        getCourse = await db.course.findUnique({
            where: { id }
        })

    } else {

        getCourse = await db.course.findMany()

    }

    return {
        status: 200,
        message: message_list.success,
        data: getCourse
    }

}

export async function UpdateCourse(
    { adminId, typeUser, adminInstitutionId, teacherId, courseId } : CheckAuth,
    { institutionId, classId, testId, name } : UpdateCourse
) { 

    check_type_user(typeUser, [type_user_list.admin, type_user_list.admin_institution, type_user_list.teacher])

    const id = courseId

    if (!id) {
        return {
            status: 400,
            message: message_list.went_wrong,
            data: null
        }
    }

    const courseExists = await db.course.findUnique({
        where: { id }
    })

    if (!courseExists) {
        return {
            status: 400,
            message: message_list.went_wrong,
            data: null
        }
    }

    const courseUpdated = await db.course.update({
        where: { id },
        data: { institutionId, classId, testId, name }
    })

    return {
        status: 201,
        message: message_list.success,
        data: null
    }

}