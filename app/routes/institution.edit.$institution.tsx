import { redirect, type MetaFunction, LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { db } from "#app/utils/db.server.ts";
import { encryptPassword, invariantResponse } from "#app/utils/misc.tsx";
import { getUserCookieId, getUserCookieType } from "#app/utils/session.server.ts";
import { Input } from "#app/components/ui/Input.tsx";
import { Select } from "#app/components/ui/Select.tsx";
import { costumValidate, email_regexp } from "#app/utils/validate.functions.ts";
import { NavigateButton } from "#app/components/NavigateButton.tsx";
import { Former } from "#app/components/Former.tsx";
import { useEffect, useState } from "react";
import { Icon } from "#app/components/ui/Icon.tsx";
import { icons } from "#app/utils/list.values.ts";
import { Container } from "#app/components/ui/Container.tsx";

// META FUNCTION
export const meta: MetaFunction = () => {
  return [
    { title: "Cheleve" },
    { name: "description", content: "Welcome to Cheleve!" },
  ];
};

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

  const userId = await getUserCookieId(request)

  if (!userId) {
    throw redirect('/login')
  }
  const id = params.institution


  const check_institution = await db.institution.findUnique({
    where: { id },
    include: {
        adminInstitution: true
    }
  })

  invariantResponse(check_institution, 'Class not found', { status: 404 })
  
  return json(check_institution)
}

export const action = async ({ request, params } : ActionFunctionArgs) => {

  const userType = await getUserCookieType(request)
  
  const form = await request.formData()

  const name = form.get("name")
  const email = form.get("email")
  const password_admin = form.get("password")
  const confirm_password = form.get("confirm_password")

  const name_ins = form.get("name_ins")
  const type = form.get("type")
  const form_ins = form.get("form")
  const address = form.get("address")

  if (
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
          formError: "Formularul nu a fost completat corect!"
      }, 
      { status: 400 }
    )
  }

  const fields = { name, email, password_admin, confirm_password, name_ins, type, form_ins, address }

  const fieldErrors = {
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
        }, 
        { status: 400 }
    )
  }

  let id = params.institution

  const institution = await db.institution.update({
    where: { id },
    data: {
      name: name_ins,
      type,
      form: form_ins,
      address
    },
    select: {
      adminInstitutionId: true
    }
  })

  id = institution.adminInstitutionId

  const password = await encryptPassword(password_admin)

  await db.adminInstitution.update({
    where: { id },
    data: {
      name,
      email,
      password
    }
  })

  throw redirect('/')

}

export default function Institution() {
  const loaderData = useLoaderData<typeof loader>()

  const actionData = useActionData<typeof action>()

  const navigate = useNavigate()
  const [toNavigate, setToNavigate] = useState(false)

  useEffect(() => {
    if (toNavigate) {
      navigate(-1)
    }
  }, [toNavigate])

  return (
    <Container
      children={
        <Former
          heading={null}
          submit="Salveaza"
          children={
            <div className="space-y-12 w-full">
              <NavigateButton action_func={() => setToNavigate(!toNavigate)} />

              <div className="space-y-6 w-full">
                <h1 className="text-4xl text-center">Date Admin</h1>
                <Input
                  type="text"
                  name="name"
                  placeholder="Nume"
                  defaultValue={actionData?.fields?.name || loaderData.adminInstitution.name}
                  icon={<Icon value={icons.user} />}
                  isError={actionData?.fieldErrors?.name}
                  style=""
                />
                <Input
                  type="text"
                  name="email"
                  placeholder="Email"
                  defaultValue={actionData?.fields?.email || loaderData.adminInstitution.email}
                  icon={<Icon value={icons.mail} />}
                  isError={actionData?.fieldErrors?.email}
                  style=""
                />
                <Input
                    type="password"
                    name="password"
                    placeholder="Parola"
                    defaultValue={actionData?.fields?.password_admin}
                    icon={<Icon value={icons.password} />}
                    isError={actionData?.fieldErrors?.password}
                    style=""
                /> 
                <Input
                    type="password"
                    name="confirm_password"
                    placeholder="Confirma parola"
                    defaultValue={actionData?.fields?.confirm_password}
                    icon={<Icon value={icons.password} />}
                    isError={actionData?.fieldErrors?.confirm_password}
                    style=""
                /> 
              </div>
              <div className="space-y-6 w-full">
                <h1 className="text-4xl text-center">Date Institutie</h1>
                <Input
                  type="text"
                  name="name_ins"
                  placeholder="Nume"
                  defaultValue={actionData?.fields?.name_ins || loaderData.adminInstitution.name}
                  icon={<Icon value={icons.profile} />}
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
                    icon={<Icon value={icons.select} />}
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
                    icon={<Icon value={icons.select} />}
                    isError={''}
                    disabled={false}
                />
                <Input
                  type="text"
                  name="address"
                  placeholder="Adresa"
                  defaultValue={actionData?.fields?.address || loaderData.address}
                  icon={<Icon value={icons.school} />}
                  isError={actionData?.fieldErrors?.address}
                  style=""
                />
              </div>
            </div>
          }
        />
      }
    />
  );
}
