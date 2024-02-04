import { redirect, type MetaFunction, LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { db } from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { getUserCookieId, getUserCookieType } from "#app/utils/session.server.ts";
import { FormModal } from "#app/components/FormModal.tsx";
import { Input } from "#app/components/ui/Input.tsx";
import { costumValidate, email_regexp } from "#app/utils/validate.functions.ts";
import { useEffect, useState } from "react";
import { NavigateButton } from "#app/components/NavigateButton.tsx";
import { Former } from "#app/components/Former.tsx";
import { Container } from "#app/components/ui/Container.tsx";
import { Icon } from "#app/components/ui/Icon.tsx";
import { icons } from "#app/utils/list.values.ts";

// META FUNCTION
export const meta: MetaFunction = () => {
  return [
    { title: "Cheleve" },
    { name: "description", content: "Welcome to Cheleve!" },
  ];
};

export const loader = async ({ request, params } : LoaderFunctionArgs) => {

  const userId = await getUserCookieId(request)
  const typeUser = await getUserCookieType(request)

  if (!userId) {
    throw redirect('/login')
  }

  const id = params.student


  const check_student = await db.student.findUnique({
    where: { id },
  })

  invariantResponse(check_student, 'Student not found', { status: 404 })
  
  return json(check_student)
}

export const action = async ({ request, params } : ActionFunctionArgs) => {

  const userType = await getUserCookieType(request)
  
  const form = await request.formData()

  const name = form.get("name")
  const email = form.get("email")
  const password_admin = form.get("password")
  const confirm_password = form.get("confirm_password")

  if (
    typeof name !== "string" ||
    typeof email !== "string"
  ) {
    return json(
      {
          fieldErrors: null,
          fields: null,
          formError: "Formularul nu a fost completat corect!",
          updated: false
      }, 
      { status: 400 }
    )
  }

  const fields = { name, email, password_admin, confirm_password }

  const fieldErrors = {
      name: costumValidate(name.length < 4, "Campul trebuie sa contina minim 4 caractere!"),
      email: costumValidate(!email_regexp.test(email), "Aceasta adresa de email nu este valida!"),
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    return json(
        {
            fieldErrors,
            fields,
            formError: null,
            updated: false
        }, 
        { status: 400 }
    )
  }

  let id = params.student

  const student = await db.student.update({
    where: { id },
    data: {
      name,
      email
    }
  })

  return json(
      {
          fieldErrors,
          fields,
          formError: null,
          updated: true
      }, 
      { status: 200 }
  )
}

export default function Student() {
  const loaderData = useLoaderData<typeof loader>()

  const actionData = useActionData<typeof action>()

  const navigate = useNavigate()
  const [toNavigate, setToNavigate] = useState(false)

  useEffect(() => {
    if (actionData?.updated) {
      navigate(-1)
    }
    if (toNavigate) {
      navigate(-1)
    }
  }, [actionData, toNavigate])

  return (
    <Container
      children={
        <Former
          heading="Date Elev"
          submit="Salveaza"
          children={
            <>
              <NavigateButton action_func={() => setToNavigate(!toNavigate)} />

              <Input
                type="text"
                name="name"
                placeholder="Nume"
                defaultValue={actionData?.fields?.name || loaderData.name}
                icon={<Icon value={icons.user} />}
                isError={actionData?.fieldErrors?.name}
                style=""
              />
              <Input
                type="text"
                name="email"
                placeholder="Email"
                defaultValue={actionData?.fields?.email || loaderData.email}
                icon={<Icon value={icons.mail} />}
                isError={actionData?.fieldErrors?.email}
                style=""
              />
            </>
          }
        />
      }
    />
  );
}
