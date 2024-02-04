import { redirect, type MetaFunction, LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/node";
import { Link, useActionData, useLoaderData } from "@remix-run/react";
import { SectionWithForm } from "#app/components/SectionWithForm.tsx";
import { db } from "#app/utils/db.server.ts";
import { icons, type_user_list } from "#app/utils/list.values.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { getUserCookieId, getUserCookieType } from "#app/utils/session.server.ts";
import { Container } from "#app/components/ui/Container.tsx";
import { Card } from "#app/components/Card.tsx";
import { Icon } from "#app/components/ui/Icon.tsx";
import { IdElem } from "#app/components/ui/IdElem.tsx";
import { InfoElem } from "#app/components/ui/InfoElem.tsx";


// META FUNCTION
export const meta: MetaFunction = () => {
  return [
    { title: "Cheleve" },
    { name: "description", content: "Welcome to Cheleve!" },
  ];
};


// LOADER FUNCTION
export const loader = async ({ request, params } : LoaderFunctionArgs) => {

  const userId = await getUserCookieId(request)
  const typeUser = await getUserCookieType(request)

  if (!userId) {
    throw redirect('/login')
  }

  const id = params.institution

  const check_institution = await db.institution.findUnique({
    where: { id },
    include: {
        teachers: true,
        classes: true
    }
  })


  invariantResponse(check_institution, 'Institution not found', { status: 404 })
  
  return json(check_institution)
}


// ACTION FUNCTION
export const action = async ({ request, params } : ActionFunctionArgs) => {

  let id = await getUserCookieId(request)

  const form = await request.formData()

  const submit_button = form.get("submit_button")

  if (!id || !params.institution) {
    throw redirect('/')
  }
  
  if (submit_button === type_user_list.teacher) {

    const teacher = await db.teacher.create({
      select: { id: true },
      data: {
        institutionId: params.institution
      }
    })

    throw redirect('/teacher/edit/' + teacher.id)

  } else if (submit_button === 'class') {

    const item_class = await db.class.create({
      select: { id: true },
      data: {
        institutionId: params.institution
      }
    })

    throw redirect('/class/edit/' + item_class.id)

  }

  return null
}


// INSTITUTION PAGE
export default function Institution() {
  const loaderData = useLoaderData<typeof loader>()

  useActionData<typeof action>()

  return (
    <Container
      children={
        <div className="flex flex-col space-y-10">
          <SectionWithForm
            title="Profesori"
            submit={<Icon value={icons.add} />}
            valueSubmit="teacher"
            childrenInForm=""
            content={true}
            children={
                loaderData.teachers?.map((item) => (
                  <Card
                    items={
                      <>
                        <IdElem item={item.id} />
                        <InfoElem icon={<Icon value={icons.user} />} label="Profesor" item={item.name} />

                        <div className="flex flex-wrap items-center justify-center space-x-4">
                          <Link to={`/teacher/edit/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">Editare</Link> 
                        </div>
                      </>
                    }
                  />
                ))
            }
          />

          <SectionWithForm
              title="Clase"
              submit={<Icon value={icons.add} />}
              valueSubmit="class"
              childrenInForm=""
              content={true}
              children={
                  loaderData.classes.map((item) => (
                    <Card
                      items={
                        <>
                          <InfoElem icon={<Icon value={icons.class} />} label="Clasa" item={!item.number || !item.letter ? 'NULL' : item.number + " " + item.letter} />

                          <div className="flex flex-wrap items-center justify-center space-x-4">
                            <Link to={`/class/edit/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">Editare</Link> 
                            <Link to={`/class/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">Vizualizare</Link>
                          </div>
                        </>
                      }
                    />
                  ))
              }
          />
        </div>
      }
    />
  );
}
