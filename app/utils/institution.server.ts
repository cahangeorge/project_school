import { db } from "./db.server"
import { check_type_user, check_user_exist } from "./functions"
import { message_list, type_user_list } from "./list.values"
import bcrypt from "bcryptjs"
import { CheckAuth } from "./types.list"

// Type Admin Institution
type AdminInstitution = {
    name: string,
    email: string,
    password: string
}

// Type Institution
type Institution = {
    nameIns: string,
    typeIns: string,
    formIns: string
    addressIns: string,
    zipCodeIns: string
}

// Function Create Institution
export async function createInstitution(
    { adminId, typeUser } : CheckAuth
) {

    check_type_user(typeUser, [type_user_list.admin])

    if (!adminId) {
        return {
            status: 400,
            message: message_list.went_wrong,
            data: null
        }
    }

    const adminExists = check_user_exist(adminId, null, false)

    if (!adminExists) {
        return {
            status: 400,
            message: message_list.admin_exists
        }
    }

    const admin = await db.adminInstitution.create({
        data: {}
    })

    const adminInstitutionId = admin.id

    const institution = await db.institution.create({
        data: { adminInstitutionId }
    })

    return {
        status: 201,
        message: message_list.admin_exists,
        data: null
    }
}

// Function Read Institution
export async function readInstitution(
    { adminId, typeUser, adminInstitutionId } : CheckAuth,
) {

    check_type_user(typeUser, [type_user_list.admin, type_user_list.admin_institution])

    const adminExists = check_user_exist(adminId, null, false)

    if (!adminExists) {
        return {
            status: 400,
            message: message_list.admin_exists,
            data: null
        }
    }

    let institution = null

    if (adminInstitutionId) {

        const id = adminInstitutionId

        institution = await db.adminInstitution.findUnique({
            where: { id },
            include: {
                institution: true
            }
        })

    } else {
        
        institution = await db.adminInstitution.findMany({
            include: {
                institution: true
            }
        })

    }

    return {
        status: 200,
        message: message_list.success,
        data: institution
    }

}

// Function Update Institution
export async function updateInstitution(
    { typeUser, adminInstitutionId } : CheckAuth,
    { name, email, password } : AdminInstitution,
    { nameIns, typeIns, formIns, addressIns, zipCodeIns } : Institution
) {

    check_type_user(typeUser, [type_user_list.admin, type_user_list.admin_institution])

    if (!adminInstitutionId) {
        return {
            status: 400,
            message: message_list.went_wrong,
            data: null
        }
    }

    const adminExists = check_user_exist(null, adminInstitutionId, false)

    if (!adminExists || !adminInstitutionId) {
        return {
            status: 400,
            message: message_list.admin_exists,
            data: null
        }
    }

    let id = adminInstitutionId

    password = await bcrypt.hash(password, 10)

    const adminInstitutionUpdated = await db.adminInstitution.update({
        where: { id },
        data: { name, email, password }
    })

    name = nameIns
    const type = typeIns
    const form = formIns
    const address = addressIns
    const zipCode = zipCodeIns

    const institutionUpdated = await db.institution.update({
        where: { adminInstitutionId },
        data: { name, type, form, address, zipCode }
    })

    return {
        status: 201,
        message: message_list.success,
        data: null
    }
    
}