import { redirect, type MetaFunction, LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { db } from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { getUserCookieId, getUserCookieType } from "#app/utils/session.server.ts";
import { FormModal } from "#app/components/FormModal.tsx";
import { costumValidate } from "#app/utils/validate.functions.ts";
import { useEffect, useState } from "react";
import { Textarea } from "#app/components/ui/Textarea.tsx";
import { Select } from "#app/components/ui/Select.tsx";
import { Container } from "#app/components/ui/Container.tsx";
import { Former } from "#app/components/Former.tsx";
import { Icon } from "#app/components/ui/Icon.tsx";
import { icons } from "#app/utils/list.values.ts";
import { NavigateButton } from "#app/components/NavigateButton.tsx";

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
  const id = params.answer


  const check_answer = await db.subjectAnswer.findUnique({
    where: { id }
  })

  invariantResponse(check_answer, 'Answer not found', { status: 404 })
  
  return json(check_answer)
}

export const action = async ({ request, params } : ActionFunctionArgs) => {
  
    const form = await request.formData()
  
    const answer = form.get("answer")
    const positive = form.get("positive")
  
    if (
      typeof answer !== "string" ||
      typeof positive !== "string"
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
  
    const fields = {
      answer, positive
    }
  
    const fieldErrors = {
      answer: costumValidate(!answer, "Acest camp trebuie completat!"),
      positive: costumValidate(!positive, "Acest camp trebuie completat!")
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
  
    const id = params.answer
    const positive_boolean = positive === 'true'

    const answer_result = await db.subjectAnswer.update({
      where: { id },
      data: {
        answer,
        positive: positive_boolean
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
          heading="Date Raspuns"
          submit="Salveaza"
          children={
            <>
              <NavigateButton action_func={() => setToNavigate(!toNavigate)} />
              <Textarea
                name="answer"
                placeholder="Raspuns"
                defaultValue={actionData?.fields?.answer || loaderData.answer
                }
                icon={<Icon value={icons.answer_subject} />}
                isError={actionData?.fieldErrors?.answer}
                style=""
              />

              <Select
                options={[
                  { value: 'false', text: 'Fals' },
                  { value: 'true', text: 'Adevarat' }
                ]}
                name="positive"
                label="Tip raspuns"
                defaultValue={actionData?.fields?.positive || loaderData.positive + ''}
                icon={<Icon value={icons.select} />}
                isError={actionData?.fieldErrors?.positive}
                disabled={false}
              />
            </>
          }
        />
      }
    />
  );
}
