import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction, json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Former } from "#app/components/Former.tsx";
import { Input } from "#app/components/ui/Input.tsx";
import { Message } from "#app/components/Message.tsx";
import { Select } from "#app/components/ui/Select.tsx";
import { getUser } from "#app/utils/auth/functions.ts";
import { type_user_list } from "#app/utils/list.values.ts";
import { checkPasswords } from "#app/utils/misc.tsx";
import { createUserSessionId, getUserCookieType, getUserCookieId } from "#app/utils/session.server.ts";
import { createUserSessionType } from "#app/utils/session.server.ts";
import { costumValidate, email_regexp } from "#app/utils/validate.functions.ts";
import { NavigateButton } from "#app/components/NavigateButton.tsx";


// META FUNCTION
export const meta: MetaFunction = () => {
    return [
        { title: "Cheleve" },
        { name: "description", content: "Login to Cheleve!" },
    ];
};


// LOADER FUNCTION
export const loader = async ({ request } : LoaderFunctionArgs) => {
    const userId = await getUserCookieId(request)
    const userType = await getUserCookieType(request)

    if (typeof userId === "string") {
        throw redirect('/')
    }

    return json(userType)
}


// ACTION FUNCTION
export const action = async ({ request } : ActionFunctionArgs) => {

    const userType = await getUserCookieType(request)
    
    const form = await request.formData()
    const typeUser = form.get("type_user")
    const email = form.get("email")
    const password = form.get("password")

    const typeUserIsCorrected = form.get("typeUserIsCorrected")

    if (!userType || typeUserIsCorrected === 'false') {

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

        const redirectTo = "/login"

        return createUserSessionType(typeUser, redirectTo)

    } else {

        if (typeof email !== "string" || typeof password !== "string") {
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

        const fields = { email, password }

        const fieldErrors = {
            email: costumValidate(!email_regexp.test(email), "Aceasta adresa de email nu este valida!"),
            password: costumValidate(password.length < 4, "Parola trebuie sa contina minim 8 caractere, trebuie sa includa caractere mari, caractere mici, caractere speciale si numere!")
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

        const typeUser = userType

        const user = await getUser({ email, typeUser, type_user_list }) // get the user

        if (typeof user === "undefined") {

            return json(
                {
                    fieldErrors,
                    fields,
                    formError: "Eroare de server internal!",
                    typeUserSelected: null
                }, 
                { status: 500 }
            )
        }

        if (!user) {

            return json(
                {
                    fieldErrors,
                    fields,
                    formError: "Utilizatorul nu exista!",
                    typeUserSelected: false
                },
                { status: 401 }
            )
        }

        const isCorrectPassword = checkPasswords(password, user.password)

        if (!isCorrectPassword) { // return status code 401 if passwords does not match
            return {
                status: 401,
                message: 'Passwords does not match!',
                data: null,
                typeUserSelected: null
            }
        }

        const redirectTo = "/"

        return createUserSessionId(user.id, redirectTo)

    }

}


// LOGIN PAGE
export default function Login() {
    const navigate = useNavigate()
    const loaderData = useLoaderData<typeof loader>()

    const actionData = useActionData<typeof action>()

    const [userType, setUserType] = useState(loaderData ? true : false)
    const [toNavigate, setToNavigate] = useState(false)

    useEffect(() => {
        if (loaderData) {
            setUserType(true)
        }

        if (actionData?.typeUserSelected === false) {
            setUserType(false)
        }

        if (toNavigate) {
            navigate(-1)
        }
        
    }, [loaderData, actionData, toNavigate])

    // console.log(userType, loaderData, actionData?.typeUserSelected === false)

    return (
        <Former
            heading="Autentifica-te"
            submit="Acceseaza contul"
            children={
                <>

                    {userType ? <NavigateButton action_func={() => setUserType(!userType)} /> : <NavigateButton action_func={() => setToNavigate(-1)} />}

                    <input type="hidden" name="typeUserIsCorrected" defaultValue={'' + userType} />

                    <Message
                        message={actionData?.formError}
                        bgColor="bg-red-500/[0.5]"
                    />

                    {userType ? (
                        <>
                            <Input
                                type="text"
                                name="email"
                                placeholder="Email"
                                defaultValue={actionData?.fields?.email}
                                icon={<i className="ri-mail-line ri-xl"></i>}
                                isError={actionData?.fieldErrors?.email}
                                style=""
                            />
                            <Input
                                type="password"
                                name="password"
                                placeholder="Parola"
                                defaultValue={actionData?.fields?.password}
                                icon={<i class="ri-lock-line ri-xl"></i>}
                                isError={actionData?.fieldErrors?.password}
                                style=""
                            />
                        </>
                    ) : (
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
                            icon={<i class="ri-expand-up-down-line ri-xl"></i>}
                            isError={''}
                            disabled={false}
                        />
                    )}
                </>
            }
        />
    )
}