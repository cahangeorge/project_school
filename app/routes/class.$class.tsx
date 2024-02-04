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
        students: true
    }
  })

  invariantResponse(check_class, 'Class not found', { status: 404 })

  console.log(typeUser)
  
  return json({
    check_class,
    typeUser, 
    userId
  })
}

export const action = async ({ request, params } : ActionFunctionArgs) => {

  let id = await getUserCookieId(request)

  const form = await request.formData()

  if (!id || !params.class) {
    throw redirect('/')
  }
  

  const student = await db.student.create({
    select: { id: true },
    data: {
      classId: params.class
    }
  })

  throw redirect('/student/edit/' + student.id)
}

export default function ClassFunctionList() {
  const loaderData = useLoaderData<typeof loader>()

  useActionData<typeof action>()

  return (
    <Container
      children={
        <div className="flex flex-col">

          <SectionWithForm
              title="Studenti"
              submit={loaderData.typeUser === type_user_list.admin || loaderData.typeUser === type_user_list.admin_institution ? <Icon value={icons.add} /> : null}
              valueSubmit={undefined}
              childrenInForm=""
              content={true}
              create_test={loaderData.typeUser === type_user_list.teacher ? loaderData.check_class.id : null}
              children={
                  loaderData.check_class.students?.map((item) => (
                    <Card
                      items={
                        <>
                          {(loaderData.typeUser === type_user_list.admin || loaderData.typeUser === type_user_list.admin_institution) && <IdElem item={item.id} />}
                          <InfoElem icon={<Icon value={icons.user} />} label={'Student'} item={item?.name} />

                          <div className="flex flex-wrap items-center justify-center space-x-4">
                            {(loaderData.typeUser === type_user_list.admin || loaderData.typeUser === type_user_list.admin_institution) && <Link to={`/student/edit/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">Editare</Link>}
                            <Link to={`/student/grades/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">Vizualizare Note</Link>
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
