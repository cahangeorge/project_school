import { redirect, type MetaFunction, LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { db } from "#app/utils/db.server.ts";
import { getUserCookieId, getUserCookieType } from "#app/utils/session.server.ts";
import { FormModal } from "#app/components/FormModal.tsx";
import { Input } from "#app/components/ui/Input.tsx";
import { costumValidate } from "#app/utils/validate.functions.ts";
import { useEffect, useState } from "react";
import { Select } from "#app/components/ui/Select.tsx";
import { SelectSubjects } from "#app/components/SelectSubjects.tsx";
import { invariantResponse } from "#app/utils/misc.tsx";
import { Container } from "#app/components/ui/Container.tsx";
import { Former } from "#app/components/Former.tsx";
import { NavigateButton } from "#app/components/NavigateButton.tsx";
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

  const id = userId

  const check_teacher = await db.teacher.findUnique({
    where: { id },
    include: {
        subjects: true
    }
  })

  invariantResponse(check_teacher, 'Teacher not found', { status: 404 })

  let subjects: any = []

  check_teacher.subjects.forEach((subject) => {
    subjects.push({
        value: subject.id,
        type: subject.requirement_type,
        text: subject.requirement
    })
  })
  
  return json(subjects)
}

export const action = async ({ request, params } : ActionFunctionArgs) => {

  const userId = await getUserCookieId(request)
  const userType = await getUserCookieType(request)
  
  const form = await request.formData()

  const subjects = form.get("subjects")
  const grade_name = form.get("grade_name")
  const resolve_number_subjects = form.get("resolve_number_subjects")
  const time_to_resolve = form.get("time_to_resolve")

  if (
    typeof subjects !== "string" ||
    typeof grade_name !== "string" ||
    typeof resolve_number_subjects !== "string" ||
    typeof time_to_resolve !== "string"
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

  const fields = { subjects, grade_name, resolve_number_subjects, time_to_resolve }

  const fieldErrors = {
      subjects: costumValidate(subjects.length < 1, "Campul trebuie sa fie completat!"),
      grade_name: costumValidate(grade_name.length < 1, "Campul trebuie sa fie completat!"),
      resolve_number_subjects: costumValidate(resolve_number_subjects.length < 1, "Campul trebuie sa fie completat!"),
      time_to_resolve: costumValidate(time_to_resolve.length < 1, "Campul trebuie sa fie completat!")
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

  const id = params.class

  const students = await db.class.findUnique({
    where: { id },
    select: {
      students: {
        select: {
          id: true
        }
      }
    }
  })

  students?.students.forEach(async (student) => {

    const current_time = new Date()

    const date_time_to_resolve = new Date(
      current_time.getFullYear(),
      current_time.getMonth(),
      current_time.getDate(),
      current_time.getHours(),
      current_time.getMinutes() + parseInt(time_to_resolve)
    )

    const formattedDate = date_time_to_resolve.toISOString()

    const grade = await db.grade.create({
      select: { id: true },
      data: {
        studentId: student.id,
        teacherId: userId,
        timeToResolve: formattedDate,
        name: grade_name
      }
    })

    const split_subjects: string[] = subjects.split(",")

    Array.from(Array(parseInt(resolve_number_subjects)).keys()).forEach( async (item) => {

      const random_index = Math.floor(Math.random() * split_subjects.length)
      const id_subject = split_subjects[random_index]
      split_subjects.splice(random_index, random_index + 1)

      await db.solution.create({
        data: {
          gradeId: grade.id,
          questionId: id_subject
        }
      })

    })

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

export default function CreateTest() {
  const loaderData = useLoaderData<typeof loader>()

  const actionData = useActionData<typeof action>()

  const navigate = useNavigate()

  const [subjects, setSubjects] = useState(loaderData)
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
          heading="Date Test"
          submit="Salveaza"
          children={
            <>
              <NavigateButton action_func={() => setToNavigate(!toNavigate)} />

              <Input
                  type="text"
                  name="grade_name"
                  placeholder="Nume test"
                  defaultValue={actionData?.fields?.grade_name}
                  icon={<Icon value={icons.answer_subject} />}
                  isError={actionData?.fieldErrors?.grade_name}
                  style=""
                />

                <SelectSubjects
                    options={subjects}
                    name="subjects"
                    label="Subiecte"
                    defaultValue={actionData?.fields?.subjects}
                    icon={<Icon value={icons.select} />}
                    isError={''}
                    disabled={false}
                />

                <Select
                    options={[
                      { value: '1', text: '1 subiect' },
                      { value: '2', text: '2 subiecte' },
                      { value: '3', text: '3 subiecte' },
                      { value: '4', text: '4 subiecte' },
                      { value: '5', text: '5 subiecte' },
                      { value: '6', text: '6 subiecte' },
                      { value: '7', text: '7 subiecte' },
                      { value: '8', text: '8 subiecte' },
                      { value: '9', text: '9 subiecte' },
                      { value: '10', text: '10 subiecte' },
                    ]}
                    name="resolve_number_subjects"
                    label="Rezolvare numar subiecte"
                    defaultValue={actionData?.fields?.resolve_number_subjects}
                    icon={<Icon value={icons.select} />}
                    isError={''}
                    disabled={false}
                />

                <Select
                    options={[
                      { value: '5', text: '5 min' },
                      { value: '10', text: '10 min' },
                      { value: '15', text: '15 min' },
                      { value: '20', text: '20 min' },
                      { value: '25', text: '25 min' },
                      { value: '30', text: '30 min' },
                      { value: '35', text: '35 min' },
                      { value: '40', text: '40 min' },
                      { value: '45', text: '45 min' },
                      { value: '50', text: '50 min' },
                    ]}
                    name="time_to_resolve"
                    label="Timp de rezolvare"
                    defaultValue={actionData?.fields?.time_to_resolve}
                    icon={<Icon value={icons.time} />}
                    isError={''}
                    disabled={false}
                />
            </>
          }
        />
      }
    />
  );
}
