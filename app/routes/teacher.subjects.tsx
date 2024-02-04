import { redirect, type MetaFunction, LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/node";
import { Link, useActionData, useLoaderData } from "@remix-run/react";
import { SectionWithForm } from "#app/components/SectionWithForm.tsx";
import { db } from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { getUserCookieId, getUserCookieType } from "#app/utils/session.server.ts";
import { Icon } from "#app/components/ui/Icon.tsx";
import { icons } from "#app/utils/list.values.ts";
import { Container } from "#app/components/ui/Container.tsx";
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

  const id = await getUserCookieId(request)
  const typeUser = await getUserCookieType(request)

  if (!id) {
    throw redirect('/login')
  }


  const check_teacher = await db.teacher.findUnique({
    where: { id },
    include: {
        subjects: true
    }
  })

  invariantResponse(check_teacher, 'Teacher not found', { status: 404 })
  
  return json(check_teacher)
}

export const action = async ({ request, params } : ActionFunctionArgs) => {
  let id = await getUserCookieId(request)

  const form = await request.formData()

  const submit_button = form.get("submit_button")

  if (!id) {
    throw redirect('/')
  }
  
  const subject = await db.subject.create({
    select: { id: true },
    data: {
      teacherId: id
    }
  })

  throw redirect('/subject/edit/' + subject.id)

  return null
}

export default function Subjects() {
  const loaderData = useLoaderData<typeof loader>()

  const actionData = useActionData<typeof action>()

  return (
    <Container
      children={
        <>
          <SectionWithForm
            title="Subiecte"
            submit={<Icon value={icons.add} />}
            valueSubmit="subject"
            childrenInForm=""
            content={true}
            children={
                loaderData.subjects?.map((item) => (
                  <Card
                    items={
                      <>
                        <InfoElem icon={<Icon value={icons.question} />} label={'Subiect'} item={item?.requirement} />
                        <InfoElem 
                          icon={<Icon value={icons.type_subject} />} 
                          label={'Tip'} 
                          item={
                            item.requirement_type === 'grid' ? 
                              'Grila' :
                              item.requirement_type === 'code' ?
                                'Cod' : null 
                          } 
                        />

                        <div className="flex flex-wrap items-center justify-center space-x-4">
                          <Link to={`/subject/edit/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">Editare</Link>
                        </div>
                      </>
                    }
                  />
                ))
            }
          />
        </>
      }
    />
  );
}
