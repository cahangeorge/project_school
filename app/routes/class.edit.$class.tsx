import { redirect, type MetaFunction, LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { db } from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { getUserCookieId, getUserCookieType } from "#app/utils/session.server.ts";
import { FormModal } from "#app/components/FormModal.tsx";
import { costumValidate } from "#app/utils/validate.functions.ts";
import { useEffect, useState } from "react";
import { Select } from "#app/components/ui/Select.tsx";
import { NavigateButton } from "#app/components/NavigateButton.tsx";
import { Former } from "#app/components/Former.tsx";
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
  const typeUser = await getUserCookieType(request)

  if (!userId) {
    throw redirect('/login')
  }

  const id = params.class

  const check_class = await db.class.findUnique({
    where: { id },
    include: {
        institution: {
            select: {
                form: true
            }
        }
    }
  })

  invariantResponse(check_class, 'Class not found', { status: 404 })
  
  return json(check_class)
}

export const action = async ({ request, params } : ActionFunctionArgs) => {

  // const userType = await getUserCookieType(request)
  
  const form = await request.formData()

  const number = form.get("number")
  const letter = form.get("letter")

  if (
    typeof number !== "string" ||
    typeof letter !== "string"
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

  const fields = { number, letter }

  const fieldErrors = {
      number: costumValidate(number.length < 1, "Campul trebuie sa fie completat!"),
      letter: costumValidate(letter.length < 1, "Campul trebuie sa fie completat!")
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

  let id = params.class

  await db.class.update({
    where: { id },
    data: {
      number,
      letter
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

export default function ClassFunction() {
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
          heading="Date Clasa"
          submit="Salveaza"
          children={
            <div className="space-y-6 w-full">
              <NavigateButton action_func={() => setToNavigate(!toNavigate)} />

              <Select
                options={
                  loaderData.institution.form === 'school' ? 
                    [
                        { value: '5', text: '5' },
                        { value: '6', text: '6' },
                        { value: '7', text: '7' },
                        { value: '8', text: '8' },
                    ] : 
                    loaderData.institution.form === 'college' ? [
                        { value: '9', text: '9' },
                        { value: '10', text: '10' },
                        { value: '11', text: '11' },
                        { value: '12', text: '12' },
                        { value: '13', text: '13' },
                    ] : []
                }
                name="number"
                label="Numar"
                defaultValue={actionData?.fields?.number || loaderData.number}
                icon={<Icon value={icons.number} />}
                isError={''}
                disabled={false}
              />

              <Select
                options={[
                    { value: 'A', text: 'A' },
                    { value: 'B', text: 'B' },
                    { value: 'C', text: 'C' },
                    { value: 'D', text: 'D' },
                    { value: 'E', text: 'E' }
                ]}
                name="letter"
                label="Litera"
                defaultValue={actionData?.fields?.letter || loaderData.letter}
                icon={<Icon value={icons.letter} />}
                isError={''}
                disabled={false}
              />
            </div>
          }
        />
      }
    />
  );
}
