import { redirect, type MetaFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { SectionWithForm } from "#app/components/SectionWithForm.tsx";
import { db } from "#app/utils/db.server.ts";
import { icons, type_user_list } from "#app/utils/list.values.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { getUserCookieId, getUserCookieType } from "#app/utils/session.server.ts";
import fs from 'fs'
import path from 'path'
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

  const path_root = 'app/codes'
  const dir_codes = fs.readdirSync(path_root)

  if (dir_codes.length > 0) {

    let id_solution = null
    let term_complete = 0
    let term_incomplete = 0
    let test_good = 0
    let test_bad = 0
    let error_file = 0

    dir_codes.forEach( async (file) => {

      id_solution = file.split('sol_')[1]

      const path_sol = path.join(path_root, file)

      const dir_sol = fs.readdirSync(path_sol)

      // console.log(dir_sol.includes('results.txt'), dir_sol)

      if (dir_sol.length > 0 && dir_sol.includes('results.txt')) {
        
        const path_results = path.join(path_sol, 'results.txt')

        const get_results = fs.readFileSync(path_results, 'utf8')

        
        if (get_results.includes("ERRORFILE")) {
          error_file++
        }

        if (get_results.includes("ENDFILE")) {
          
          const get_lines = get_results.split('\n')

          get_lines.forEach((line) => {

            if (line.includes('term_complete')) 
              term_complete++
            else if (line.includes('term_incomplete'))
              term_incomplete++
            else if (line.includes("test_good"))
              test_good++
            else if (line.includes("test_bad"))
              test_bad++

          })

        }

        if (fs.existsSync(path.join(path_sol, 'code.cpp')))
            fs.unlinkSync(path.join(path_sol, 'code.cpp'))
          
        if (fs.existsSync(path.join(path_sol, 'results.txt')))
          fs.unlinkSync(path.join(path_sol, 'results.txt'))

        if (fs.existsSync(path.join(path_sol, 'runner.exe')))
          fs.unlinkSync(path.join(path_sol, 'runner.exe'))
        

        if (fs.existsSync(path_sol))
          fs.rmdirSync(path_sol)

      }

      const get_solution = await db.solution.findUnique({
        where: { id: id_solution },
        select: {
          status: true,
          grade: {
            select: {
              status: true
            }
          }
        }
      })

      
      let status_sol = ''

      if (error_file > 0) {
        status_sol += 'error_file,'
      }

      if (test_bad > 0) {
        status_sol += 'test_bad,'
      }

      if (term_incomplete > 0) {
        status_sol += 'term_incomplete,'
      }

      if (test_good > 0) {
        status_sol += 'test_good,'
      }

      if (term_complete > 0) {
        status_sol += 'term_complete'
      }

      await db.solution.update({
        where: { id: id_solution },
        data: {
          status: status_sol
        }
      })

      // await db.grade.update({
      //   where: { id: get_solution.grade.status }
      // })

    })

  }

  const userId = await getUserCookieId(request)
  const userType = await getUserCookieType(request)

  let first_id = null
  let second_id = null

  if (userType === type_user_list.teacher) {
    first_id = params.param_id
    second_id = userId
  } else if (userType === type_user_list.student) {
    first_id = userId
    second_id = params.param_id
  }

  if (!userId) {
    throw redirect('/login')
  }
  // const id = params.teacher

  let check_student = null
 if (userType === type_user_list.admin_institution || userType === type_user_list.admin) {
  check_student = await db.student.findUnique({
    where: { id: params.param_id },
    include: {
        grades: {
          
          include: {
              teacher: {
                  select: {
                      name: true,
                      course: true
                  }
              },
              solutions: true
          }
        }
    }
  })
 }
 
 if (userType === type_user_list.teacher || userType === type_user_list.student) {
  check_student = await db.student.findUnique({
    where: { id: first_id },
    include: {
        grades: {
          where: { teacherId: second_id },
          include: {
              teacher: {
                  select: {
                      name: true,
                      course: true
                  }
              },
              solutions: true
          }
        }
    }
  })
 }

//  console.log(check_student)

  invariantResponse(check_student, 'Student not found', { status: 404 })

  
  let grades: any = {}

  check_student?.grades.forEach((grade) => {

    if (!grades.hasOwnProperty(grade.teacherId)) {

        grades[grade.teacherId] = [grade]

    } else {

        grades[grade.teacherId].push(grade)

    }

  })

  let new_grades = []
  for (const [key, value] of Object.entries(grades)) {

    new_grades.push(value)

  }
  
  return json({
    new_grades,
    userType,
    student_name: check_student.name
  })
}

export default function Gardes() {
  const loaderData = useLoaderData<typeof loader>()

  console.log(loaderData)

  return (
    <Container
      children={
        <div className="flex flex-col">
          {loaderData.new_grades.map((course: any) => (

            <SectionWithForm
                title={loaderData.userType === type_user_list.teacher ? loaderData.student_name : course[0].teacher.course + ' - ' + course[0].teacher.name}
                submit={null} 
                valueSubmit={undefined}
                childrenInForm=""
                content={false}
                children={
                    course?.map((grade: any) => (
                      <Card
                        items={
                          <>

                            <InfoElem icon={<Icon value={icons.test} />} label={'Test'} item={grade.name} />

                            {grade.completed && <InfoElem icon={<Icon value={icons.grade} />} label={'Nota'} item={grade.mark + 'puncte'} />}

                            {!grade.completed && (loaderData.userType === type_user_list.teacher || loaderData.userType === type_user_list.admin_institution || loaderData.userType === type_user_list.admin) && 
                              <InfoElem icon={<Icon value={icons.grade} />} label={'Status'} item={'Nerezolvat'} /> 
                            }

                            <div className="flex flex-wrap items-center justify-center space-x-4">
                              {!grade.completed && loaderData.userType === type_user_list.student && <Link to={`/test/` + grade.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center">Rezolva testul</Link>}
                              {/* <Link to={`/test/` + grade.id} className="border-2 border-dotted border-white hover:border-solid p-3 rounded-3xl shadow text-center">Rezolva testul</Link> */}
                              {grade.completed && <Link to={`/student/grades/solutions/` + grade.id} className="border-2 border-dashed border-white hover:border-solid p-2 rounded-xl shadow text-center">Vizualizare Solutii</Link>}
                            </div>
                          </>
                        }
                      />
                    ))
                }
            />

          ))}
        </div>
      }
    />
  );
}
