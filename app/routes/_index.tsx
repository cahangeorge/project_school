import { redirect, type MetaFunction, LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigation } from "@remix-run/react";
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
export const loader = async ({ request } : LoaderFunctionArgs) => {

  const userId = await getUserCookieId(request) // get user id
  const typeUser = await getUserCookieType(request) // get type user

  // if (typeof userId !== "string" || typeof typeUser !== "string") {
  //   throw redirect('/login')
  // }

  const id = userId
  const check_user: {
    type: string | null,
    data?: any,
    id: string | null
  } = {
    type: null,
    id: id
  }

  if (typeUser === type_user_list.admin && typeof id === 'string') { // if user is admin

    check_user.type = type_user_list.admin
    check_user.data = await db.institution.findMany({
      include: {
        adminInstitution: true
      }
    })

  } else if (typeUser === type_user_list.admin_institution && typeof id === 'string') { // if user is admin institution

    check_user.type = type_user_list.admin_institution
    check_user.data = await db.adminInstitution.findUnique({
      where: { id },
      include: {
        institution: {
          include: {
            classes: true,
            teachers: true
          }
        }
      }
    })

  } else if (typeUser === type_user_list.teacher && typeof id === 'string') { // if user is teacher

    check_user.type = type_user_list.teacher
    check_user.data = await db.teacher.findUnique({
      where: { id },
      include: {
        institution: {
          include: {
            classes: true
          }
        }
      }
    })
    
  } else if (typeUser === type_user_list.student && typeof id === 'string') { // if user is student

    check_user.type = type_user_list.student
    check_user.data = await db.student.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            institution: {
              include: {
                teachers: true
              }
            }
          }
        }
      }
    })

  }

  invariantResponse(check_user, 'User not found', { status: 404 })
  
  return json(check_user)
}


// ACTION FUNCTION
export const action = async ({ request } : ActionFunctionArgs) => {

  const userType = await getUserCookieType(request) // get user type
  let userId = await getUserCookieId(request) // get user id

  if (!userId) {
    throw redirect('/login')
  }
  
  if (userType === type_user_list.admin) {
    
    const adminInstitution = await db.adminInstitution.create({
      select: { id: true },
      data: {}
    })

    const institution = await db.institution.create({
      select: { id: true },
      data: {
        adminInstitutionId: adminInstitution.id
      }
    })

    throw redirect('/institution/edit/' + institution.id)

  } else if (userType === type_user_list.admin_institution) {

    const form = await request.formData()

    const submit_button = form.get("submit_button")

    const get_institution = await db.adminInstitution.findUnique({
      where: { id: userId },
      select: {
        institution: {
          select: {
            id: true
          }
        }
      }
    })

    if (get_institution?.institution?.id)
      userId = get_institution?.institution.id

    if (submit_button === type_user_list.teacher) {

      const teacher = await db.teacher.create({
        select: { id: true },
        data: {
          institutionId: userId
        }
      })

      throw redirect('/teacher/edit/' + teacher.id)

    } else if (submit_button === 'class') {

      const item_class = await db.class.create({
        select: { id: true },
        data: {
          institutionId: userId
        }
      })

      throw redirect('/class/edit/' + item_class.id)

    }
    
  }

  return null
}


// INDEX PAGE
export default function Index() {
  const loaderData = useLoaderData<typeof loader>()

  const navigation = useNavigation()

  if (!loaderData.type) {
    return (
      <Container
        children={
          <div className="
            w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%]
            border-2 border-dashed border-white
            backdrop-blur-xl
            bg-sky-600/20
            shadow-md 
            text-white 
            rounded-xl
            px-3 py-6
            my-10
            mx-auto
          ">
            <h1 className="text-4xl text-center text-white">Alege participarea:</h1>
            <div className="flex flex-wrap justify-center">
              <Link to="/login" className={`${navigation.state === 'loading' && 'cursor-not-allowed opacity-50'} outline-none rounded-xl p-3 shadow-md bg-transparent border-2 border-white border-dashed text-white text-sm font-semibold transition-all ease-in-out duration-300 hover:border-solid hover:scale-105 m-6`}>Autentifica-te</Link>
              <Link to="/check_code_register" className={`${navigation.state === 'loading' && 'cursor-not-allowed'} outline-none rounded-xl p-3 shadow-md bg-transparent border-2 border-white border-dashed text-white text-sm font-semibold transition-all ease-in-out duration-300 hover:border-solid hover:scale-105 m-6`}>Inregistreaza-te</Link>
            </div>
          </div>
        }
      />
    )
  }

  return (
    <Container
      children={
        <div className="flex flex-col space-y-10">

          <SectionWithForm

              title={
                loaderData.type === type_user_list.admin ?
                  "Institutii" :
                  loaderData.type === type_user_list.admin_institution ?
                    "Clase" :
                    loaderData.type === type_user_list.teacher ?
                      "Cursuri" :
                      loaderData.type === type_user_list.student ?
                        "Cursuri" : ""
              }

              submit={
                loaderData.type === type_user_list.admin ?
                  <Icon value={icons.add} /> : 
                  loaderData.type === type_user_list.admin_institution ?
                    <Icon value={icons.add} /> :
                    loaderData.type === type_user_list.teacher ?
                      null : 
                      loaderData.type === type_user_list.student ?
                        null : null
              }

              valueSubmit={loaderData.type === type_user_list.admin_institution ? 'class' : undefined}

              childrenInForm=""

              content={true}

              to_subjects={loaderData.type === type_user_list.teacher ? true : false}
              
              children={
                  loaderData.type === type_user_list.admin ?
                    loaderData.data.map((item: any) => (
                      <Card
                        items={
                          <>
                            <IdElem item={item.id} />
                            <InfoElem icon={<Icon value={icons.school} />} label={'Institutie'} item={item?.name} />
                            <InfoElem icon={<Icon value={icons.user} />} label={'Admin Institutie'} item={item?.adminInstitution?.name} />

                            <div className="flex flex-wrap items-center justify-center space-x-4">
                              <Link to={'/institution/edit/' + item?.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">{navigation.state === 'loading' ? <Icon value={icons.loader} /> : "Editare"}</Link>
                              <Link to={'/institution/' + item?.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">{navigation.state === 'loading' ? <Icon value={icons.loader} /> : "Vizualizare"}</Link>
                            </div>
                          </>
                        }
                      />
                    )) :

                    loaderData.type === type_user_list.admin_institution ?
                      loaderData.data.institution.classes.map((item: any) => (
                        <Card
                          items={
                            <>
                              <InfoElem icon={<Icon value={icons.class} />} label="Clasa" item={!item.number || !item.letter ? 'NULL' : item.number + " " + item.letter} />

                              <div className="flex flex-wrap items-center justify-center space-x-4">
                                <Link to={`/class/edit/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">{navigation.state === 'loading' ? <Icon value={icons.loader} /> : "Editare"}</Link> 
                                <Link to={`/class/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">{navigation.state === 'loading' ? <Icon value={icons.loader} /> : "Vizualizare"}</Link>
                              </div>
                            </>
                          }
                        />
                      )) : 

                      loaderData.type === type_user_list.teacher ?
                        loaderData.data.institution.classes.map((item: any) => (
                          <Card
                            items={
                              <>

                                <InfoElem icon={<Icon value={icons.class} />} label="Clasa" item={!item.number || !item.letter ? 'NULL' : item.number + " " + item.letter} />

                                <div className="flex flex-wrap items-center justify-center space-x-4">
                                  <Link to={`/class/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">{navigation.state === 'loading' ? <Icon value={icons.loader} /> : "Vizualizare"}</Link>
                                </div>
                              </>
                            }
                          />
                        )) :

                        loaderData.type === type_user_list.student ?
                          loaderData.data.class.institution.teachers.map((item: any) => (
                            <Card
                              items={
                                <>
                                  <InfoElem icon={<Icon value={icons.user} />} label="Profesor" item={!item.name ? "NULL" : item.name} />
                                  <InfoElem icon={<Icon value={icons.course} />} label="Materia" item={!item.course ? "NULL" : item.course} />

                                  <div className="flex flex-wrap items-center justify-center space-x-4">
                                    <Link to={`/student/grades/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">{navigation.state === 'loading' ? <Icon value={icons.loader} /> : "Note"}</Link>
                                  </div>
                                </>
                              }
                            />
                          )) : null
              }
          />

          {
            loaderData.type === type_user_list.admin_institution ? 
              (
                <SectionWithForm
                  title="Profesori"
                  submit={<Icon value={icons.add} />}
                  valueSubmit="teacher"
                  childrenInForm=""
                  content={true}
                  children={
                      loaderData.data.institution.teachers.map((item: any) => (
                        <Card
                          items={
                            <>
                              <IdElem item={item.id} />
                              <InfoElem icon={<Icon value={icons.user} />} label="Profesor" item={item.name} />

                              <div className="flex flex-wrap items-center justify-center space-x-4">
                                <Link to={`/teacher/edit/` + item.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center flex-1">{navigation.state === 'loading' ? <Icon value={icons.loader} /> : "Editare"}</Link> 
                              </div>
                            </>
                          }
                        />
                      ))
                  }
                />
              ) : null
              
          }
        </div>
      }
    />
  );
}
