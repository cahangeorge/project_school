import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Former } from "#app/components/Former.tsx";
import { Input } from "#app/components/ui/Input.tsx";
import { Message } from "#app/components/Message.tsx";
import { Select } from "#app/components/ui/Select.tsx";
import { type_user_list } from "#app/utils/list.values.ts";
import { encryptPassword } from "#app/utils/misc.tsx";
import { createUserSessionId, getUserCookieType, getUserCookieId } from "#app/utils/session.server.ts";
import { createUserSessionType } from "#app/utils/session.server.ts";
import { costumValidate, email_regexp } from "#app/utils/validate.functions.ts";
import { db } from "#app/utils/db.server.ts";

// META FUNCTION
export const meta: MetaFunction = () => {
    return [
      { title: "Cheleve" },
      { name: "description", content: "Welcome to Cheleve!" },
    ];
  };

// Check if user is logged or not
export const loader = async ({ request } : LoaderFunctionArgs) => {
    const userId = await getUserCookieId(request)
    const userType = await getUserCookieType(request)

    if (typeof userId === "string") {
        throw redirect('/')
    }

    return json(userType)
}

export const action = async ({ request } : ActionFunctionArgs) => {

    const userType = await getUserCookieType(request)
    
    const form = await request.formData()
    const typeUser = form.get("type_user")

    const typeUserIsCorrected = form.get("typeUserIsCorrected")


    const code = form.get("code")
    const name = form.get("name")
    const email = form.get("email")
    const password_admin = form.get("password")
    const confirm_password = form.get("confirm_password")

    const name_ins = form.get("name_ins")
    const type = form.get("type")
    const form_ins = form.get("form")
    const address = form.get("address")

    // console.log(userType, !userType)
    // console.log(typeUserIsCorrected, typeUserIsCorrected)

    if (!userType || typeUserIsCorrected === 'false') {

        // console.log(userType, typeUserIsCorrected)

        if (typeof typeUser !== "string") {
            return json(
                {
                    fieldErrors: null,
                    fields: null,
                    formError: "Formularul nu a fost completat corect!",
                    typeUserSelected: null
                }, 
                { status: 400 }
            )
        }

        const redirectTo = "/check_code_register"

        return createUserSessionType(typeUser, redirectTo)

    } else if (userType === type_user_list.admin_institution) {

        if (
            typeof code !== "string" ||
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password_admin !== "string" ||
            typeof confirm_password !== "string" ||
            typeof name_ins !== "string" ||
            typeof type !== "string" ||
            typeof form_ins !== "string" ||
            typeof address !== "string"
        ) {
            return json(
                {
                    fieldErrors: null,
                    fields: null,
                    formError: "Formularul nu a fost completat corect!",
                    typeUserSelected: null
                }, 
                { status: 400 }
            )
        }
    
        const fields = { code, name, email, password_admin, confirm_password, name_ins, type, form_ins, address }
    
        const fieldErrors = {
            code: costumValidate(code.length < 16, "Campul trebuie completat cu codul de inregistrare primit!"),
            name: costumValidate(name.length < 4, "Campul trebuie sa contina minim 4 caractere!"),
            email: costumValidate(!email_regexp.test(email), "Aceasta adresa de email nu este valida!"),
            password: costumValidate(password_admin.length < 4, "Parola trebuie sa contina minim 4 caractere!"),
            confirm_password: costumValidate(confirm_password !== password_admin, "Parolele nu coincid!"),
            name_ins: costumValidate(name_ins.length < 4, "Campul trebuie sa contina minim 4 caractere!"),
            type: costumValidate(!type, "Acest camp trebuie completat!"),
            form_ins: costumValidate(!form_ins, "Acest camp trebuie completat!"),
            address: costumValidate(address.length < 4, "Acest camp trebuie sa contina minim 4 caractere!")
        }
    
        if (Object.values(fieldErrors).some(Boolean)) {
            return json(
                {
                    fieldErrors,
                    fields,
                    formError: null,
                    typeUserSelected: null
                }, 
                { status: 400 }
            )
        }

        
    
        let id = code

        const check_admin_institution = await db.adminInstitution.findUnique({
            where: { id },
            select: {
                institution: {
                    select: {
                        id: true
                    }
                }
            }
        })

        if (!check_admin_institution) {
            return json(
                {
                    fieldErrors,
                    fields,
                    formError: null,
                    typeUserSelected: false
                }, 
                { status: 400 }
            )
        }

        const password = await encryptPassword(password_admin)
    
        await db.adminInstitution.update({
            where: { id },
            data: {
                name,
                email,
                password
            }
        })
    
        id = check_admin_institution?.institution?.id
    
        const institution = await db.institution.update({
            where: { id },
            data: {
                name: name_ins,
                type,
                form: form_ins,
                address
            }
        })

        const redirectTo = "/"

        return createUserSessionId(code, redirectTo)

    }

}

export default function Login() {
    const loaderData = useLoaderData<typeof loader>()

    const actionData = useActionData<typeof action>()

    // console.log(actionData)

    const [userType, setUserType] = useState(loaderData ? true : false)

    useEffect(() => {
        if (loaderData) 
            setUserType(true)

        if (actionData?.typeUserSelected === false) 
            setUserType(false)
    }, [loaderData, actionData])

    return (
        <Former
            heading="Completare date"
            submit="Salveaza"
            children={
                <div className="space-y-5 w-4/5 sm:w-2/3 md:w-1/2">

                    {userType && <button className="border-2 border-white border-dashed p-2 rounded-2xl shadow absolute top-5 left-5" type="button" onClick={() => setUserType(!userType)}>Inapoi</button>}

                    <input type="hidden" name="typeUserIsCorrected" defaultValue={'' + userType} />

                    <Message
                        message={actionData?.formError}
                        bgColor="bg-red-500/[0.5]"
                    />

                    {userType ? (
                        loaderData === type_user_list.admin_institution ?
                            (
                                <div className="space-y-12">
                                    <div className="space-y-6">
                                    <h1 className="text-4xl text-center">Date Admin</h1>
                                    <Input
                                        type="text"
                                        name="name"
                                        placeholder="Nume"
                                        defaultValue={actionData?.fields?.name}
                                        icon={<i className='bx bx-user'></i>}
                                        isError={actionData?.fieldErrors?.name}
                                        style=""
                                    />
                                    <Input
                                        type="text"
                                        name="email"
                                        placeholder="Email"
                                        defaultValue={actionData?.fields?.email}
                                        icon={<i className='bx bx-user'></i>}
                                        isError={actionData?.fieldErrors?.email}
                                        style=""
                                    />
                                    <Input
                                        type="password"
                                        name="password"
                                        placeholder="Parola"
                                        defaultValue={actionData?.fields?.password_admin}
                                        icon={<i className='bx bx-lock'></i>}
                                        isError={actionData?.fieldErrors?.password}
                                        style=""
                                    /> 
                                    <Input
                                        type="password"
                                        name="confirm_password"
                                        placeholder="Confirma parola"
                                        defaultValue={actionData?.fields?.confirm_password}
                                        icon={<i className='bx bx-lock'></i>}
                                        isError={actionData?.fieldErrors?.confirm_password}
                                        style=""
                                    /> 
                                    </div>
                                    <div className="space-y-6">
                                    <h1 className="text-4xl text-center">Date Institutie</h1>
                                    <Input
                                        type="text"
                                        name="code"
                                        placeholder="Cod autentificare"
                                        defaultValue={actionData?.fields?.code}
                                        icon={<i className='bx bx-user'></i>}
                                        isError={actionData?.fieldErrors?.code}
                                        style=""
                                    />
                                    <Input
                                        type="text"
                                        name="name_ins"
                                        placeholder="Nume"
                                        defaultValue={actionData?.fields?.name_ins}
                                        icon={<i className='bx bx-user'></i>}
                                        isError={actionData?.fieldErrors?.name_ins}
                                        style=""
                                    />
                                    <Select
                                        options={[
                                            { value: 'state', text: 'Stat' },
                                            { value: 'private', text: 'Privat' },
                                        ]}
                                        name="type"
                                        label="Tip"
                                        defaultValue={loaderData.type}
                                        icon={<i className='bx bx-user'></i>}
                                        isError={''}
                                        disabled={false}
                                    />
                                    <Select
                                        options={[
                                            { value: 'college', text: 'Liceu' },
                                            { value: 'school', text: 'Scoala' },
                                        ]}
                                        name="form"
                                        label="Forma"
                                        defaultValue={loaderData.form}
                                        icon={<i className='bx bx-user'></i>}
                                        isError={''}
                                        disabled={false}
                                    />
                                    <Input
                                        type="text"
                                        name="address"
                                        placeholder="Adresa"
                                        defaultValue={actionData?.fields?.address}
                                        icon={<i className='bx bx-user'></i>}
                                        isError={actionData?.fieldErrors?.address}
                                        style=""
                                    />
                                    </div>
                                </div>
                            ) : null
                    ) : (
                        <>
                            <Select
                                options={[
                                    { value: type_user_list.admin, text: 'Admin' },
                                    { value: type_user_list.admin_institution, text: "Admin Institutie" },
                                    { value: type_user_list.teacher, text: 'Profesor' },
                                    { value: type_user_list.student, text: 'Elev' }
                                ]}
                                name="type_user"
                                label="Tip utilizator"
                                defaultValue={loaderData}
                                icon={<i className='bx bx-user'></i>}
                                isError={''}
                                disabled={false}
                            />
                        </>
                    )}
                </div>
            }
        />
    )
}