import { redirect, type MetaFunction, LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/node";
import { Link, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { SectionWithForm } from "#app/components/SectionWithForm.tsx";
import { db } from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { getUserCookieId, getUserCookieType } from "#app/utils/session.server.ts";
import { FormModal } from "#app/components/FormModal.tsx";
import { costumValidate } from "#app/utils/validate.functions.ts";
import { useEffect, useState } from "react";
import { Textarea } from "#app/components/ui/Textarea.tsx";
import { Select } from "#app/components/ui/Select.tsx";
import { Variables } from "#app/components/Variables.tsx";
import { RestrictVariables } from "#app/components/RestrictVariables.tsx";
import { DemoDataContainer } from "#app/components/DemoDataContainer.tsx";
import { TypeVariables } from "#app/components/TypeVariables.tsx";
import { Structures } from "#app/components/Structures.tsx";
import { Container } from "#app/components/ui/Container.tsx";
import { NavigateButton } from "#app/components/NavigateButton.tsx";
import { Former } from "#app/components/Former.tsx";
import { Icon } from "#app/components/ui/Icon.tsx";
import { icons } from "#app/utils/list.values.ts";
import { Card } from "#app/components/Card.tsx";
import { InfoElem } from "#app/components/ui/InfoElem.tsx";

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

  const id = params.subject


  const check_subject = await db.subject.findUnique({
    where: { id },
    include: {
        answers: true
    }
  })

  invariantResponse(check_subject, 'Subject not found', { status: 404 })
  
  return json(check_subject)
}

export const action = async ({ request, params } : ActionFunctionArgs) => {

    let id = await getUserCookieId(request)
  
    const form = await request.formData()

    const submit_button = form.get("submit_button")

    if (submit_button === 'answer') {

      const answer = await db.subjectAnswer.create({
        select: { id: true },
        data: {
          questionId: params.subject
        }
      })
  
      throw redirect('/answer/edit/' + answer.id)
  
    }
  
    const requirement = form.get("requirement")
    const requirement_type = form.get("requirement_type")
  
    const input_data = form.get("input_data")
    const output_data = form.get("output_data")

    const variables = form.get("variables")
    const variables_modified = form.get("variables_modified")

    const restrict_and_specs = form.get("restrict_and_specs")

    const structures = form.get("structures")

    const example = form.get("example")
    const explanation = form.get("explanation")
  
    const correction_type = form.get("correction_type")
  
    let score = form.get("score")
    // score = ''
  
    console.log(requirement, requirement_type,
      input_data, output_data, 
      variables, variables_modified, 
      restrict_and_specs, structures, 
      example, explanation,
      correction_type, score)
  
    if (
      typeof requirement !== "string" ||
      typeof requirement_type !== "string"
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
  
    if (
      requirement_type === 'code' && 
      (
        typeof input_data !== "string" ||
        typeof output_data !== "string" ||
        // typeof variables !== "string" ||
        // typeof variables_modified !== "string" ||
        // typeof restrict_and_specs !== "string" ||
        // typeof structures !== "string" ||
        typeof example !== "string"
        // typeof explanation !== "string"
      )
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
  
    if (/*correction_type === 'manual' && */typeof score !== 'string') {
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
      requirement, requirement_type,
      input_data, output_data, 
      variables, variables_modified, 
      restrict_and_specs, structures, 
      example, explanation,
      correction_type, score
    }
  
    const fieldErrors = {
      requirement: costumValidate(!requirement, "Acest camp trebuie completat!"),
      requirement_type: costumValidate(!requirement_type, "Acest camp trebuie completat!"),
      // correction_type: costumValidate(!correction_type, "Acest camp trebuie completat!"),
      input_data: null,
      output_data: null,
      // variables: null,
      // variables_modified: null,
      // restrict_and_specs: null,
      // structures: null,
      example: null,
      // explanation: null,
      score: null
    }
  
    if (requirement_type === 'code') {
      fieldErrors.input_data = costumValidate(!input_data, "Acest camp trebuie completat!")
      fieldErrors.output_data = costumValidate(!output_data, "Acest camp trebuie completat!")
      // fieldErrors.variables = costumValidate(!variables, "Acest camp trebuie completat!")
      // fieldErrors.variables_modified = costumValidate(!variables_modified, "Acest camp trebuie completat!")
      // fieldErrors.restrict_and_specs = costumValidate(!restrict_and_specs, "Acest camp trebuie completat!")
      // fieldErrors.structures = costumValidate(!structures, "Acest camp trebuie completat!")
      fieldErrors.example = costumValidate(!example, "Acest camp trebuie completat!")
      // fieldErrors.explanation = costumValidate(!explanation, "Acest camp trebuie completat!")
    }
  
    // console.log(score)
  
    // if (correction_type === 'manual') {
      fieldErrors.score = costumValidate(!score, "Acest camp trebuie completat!")
    // }
  
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
  
    const teacherId = id
    const subject = await db.subject.update({
      where: { id: params.subject },
      data: {
        requirement, requirement_type,
        input_data, output_data, 
        variables, variables_modified, 
        restrict_and_specs, structures, 
        example, explanation,
        score
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

  const [showCode, setShowCode] = useState(loaderData.requirement_type || '')
  const [showScore, setShowScore] = useState(loaderData.correction_type || "")

  const [variables, setVariables] = useState<any>(loaderData.variables?.split(',') || [])
  const [structures, setStructures] = useState<any>(loaderData.structures?.split(',') || [])

  return (
    <Container
      children={
        <>

          <Former
            heading="Date Subiect"
            submit="Salveaza"
            children={
              <>
                <NavigateButton action_func={() => setToNavigate(!toNavigate)} />
                
                <Textarea
                    name="requirement"
                    placeholder="Cerinta"
                    defaultValue={actionData?.fields?.requirement || loaderData.requirement
                    }
                    icon=""
                    isError={actionData?.fieldErrors?.requirement}
                    style=""
                />

                <Select
                    options={[
                    { value: 'grid', text: 'Grila' },
                    // { value: 'write', text: 'Descriere' },
                    { value: 'code', text: 'Cod' }
                    ]}
                    name="requirement_type"
                    label="Tip cerinta"
                    defaultValue={actionData?.fields?.requirement_type || loaderData.requirement_type}
                    icon={<Icon value={icons.select} />}
                    isError={actionData?.fieldErrors?.requirement_type}
                    disabled={false}
                    setSecondValue={setShowCode}
                />

                {/* <Select
                    options={[
                    { value: 'auto', text: 'Automat' },
                    { value: 'manual', text: 'Manual' },
                    ]}
                    name="correction_type"
                    label="Tip nota"
                    defaultValue={actionData?.fields?.correction_type || loaderData.correction_type}
                    icon=""
                    isError={actionData?.fieldErrors?.correction_type}
                    disabled={false}
                    setSecondValue={setShowScore}
                /> */}

                {/* {showScore === 'manual' && ( */}
                    <Select
                      options={[
                          { value: '10', text: '10 pct' },
                          { value: '15', text: '15 pct' },
                          { value: '20', text: '20 pct' },
                          { value: '25', text: '25 pct' },
                          { value: '30', text: '30 pct' },
                          { value: '50', text: '50 pct' },
                      ]}
                      name="score"
                      label="Scor"
                      defaultValue={actionData?.fields?.score || loaderData.score}
                      icon={<Icon value={icons.select} />}
                      isError={actionData?.fieldErrors?.score}
                      disabled={false}
                    />
                {/* )} */}

                
                {showCode === 'code' && (
                    <>

                    <Textarea
                        name="input_data"
                        placeholder="Date de intrare"
                        defaultValue={actionData?.fields?.input_data || loaderData.input_data}
                        icon=""
                        isError={actionData?.fieldErrors?.input_data}
                        style=""
                    />
                    <Textarea
                        name="output_data"
                        placeholder="Date de iesire"
                        defaultValue={actionData?.fields?.output_data || loaderData.output_data}
                        icon=""
                        isError={actionData?.fieldErrors?.output_data}
                        style=""
                    />

                    <Variables
                        name="variables"
                        placeholder="Variabile"
                        defaultValue={actionData?.fields?.variables || loaderData.variables}
                        isError=""
                        style=""
                        variables={variables}
                        setVariables={setVariables}
                    />
                    <TypeVariables
                        name="variables_modified"
                        placeholder="Variabile modificate"
                        defaultValue={actionData?.fields?.variables_modified || loaderData.variables_modified}
                        isError=""
                        style=""
                        variables={variables}
                        setVariables={setVariables}
                    />

                    <RestrictVariables
                        name="restrict_and_specs"
                        placeholder="Restrictii si specificatii"
                        defaultValue={actionData?.fields?.restrict_and_specs || loaderData.restrict_and_specs}
                        isError=""
                        style=""
                        variables={variables}
                        setVariables={setVariables}
                    />

                    <Structures
                        name="structures"
                        placeholder="Structuri"
                        defaultValue={actionData?.fields?.structures || loaderData?.structures}
                        isError=""
                        style=""
                        variables={structures}
                        setVariables={setStructures}
                    />

                    {/* <Textarea
                        name="restrict_and_specs"
                        placeholder="Restrictii si specificatii"
                        defaultValue={actionData?.fields?.restrict_and_specs}
                        icon=""
                        isError={actionData?.fieldErrors?.restrict_and_specs}
                        style=""
                    /> */}
                    <DemoDataContainer
                        name="example"
                        placeholder="Exemplu - (primul set de date va fi afisat pentru rezolvare)"
                        defaultValue={actionData?.fields?.example || loaderData.example}
                        icon=""
                        isError={actionData?.fieldErrors?.example}
                        style=""
                    />
                    <Textarea
                        name="explanation"
                        placeholder="Explicatie"
                        defaultValue={actionData?.fields?.explanation || loaderData.explanation}
                        icon=""
                        isError={actionData?.fieldErrors?.explanation}
                        style=""
                    />
                    </>
                )}
              </>
            }
          />

          {loaderData.requirement_type === 'grid' && (
              <SectionWithForm
                  title="Raspunsuri"
                  submit={<Icon value={icons.add} />}
                  valueSubmit="answer"
                  childrenInForm=""
                  content={true}
                  children={
                      loaderData.answers?.map((item) => (
                        <Card
                          items={
                            <>
                              <InfoElem icon={<Icon value={icons.answer_subject} />} label={'Raspuns'} item={item?.answer} />
                              <InfoElem icon={<Icon value={icons.type_subject} />} label={'Valoare'} item={item?.positive ? 'Adevarat' : 'Fals'} />

                              <div className="flex flex-wrap items-center justify-center space-x-4">
                                <Link to={`/answer/edit/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">Editare</Link>
                              </div>
                            </>
                          }
                        />
                      ))
                  }
              />
          )}
        </>
      }
    />
  );
}
