// import { redirect, type MetaFunction, LoaderFunctionArgs, json } from "@remix-run/node";
// import { useLoaderData } from "@remix-run/react";
// import { SectionWithForm } from "#app/components/SectionWithForm.tsx";
// import { db } from "#app/utils/db.server.ts";
// import { invariantResponse } from "#app/utils/misc.tsx";
// import { getUserCookieId, getUserCookieType } from "#app/utils/session.server.ts";
// import { Container } from "#app/components/ui/Container.tsx";
// import { Card } from "#app/components/Card.tsx";
// import { InfoElem } from "#app/components/ui/InfoElem.tsx";
// import { Icon } from "#app/components/ui/Icon.tsx";
// import { icons } from "#app/utils/list.values.ts";

// // META FUNCTION
// export const meta: MetaFunction = () => {
//   return [
//     { title: "Cheleve" },
//     { name: "description", content: "Welcome to Cheleve!" },
//   ];
// };

// export const loader = async ({ request, params } : LoaderFunctionArgs) => {

//   const userId = await getUserCookieId(request)
//   const typeUser = await getUserCookieType(request)

//   if (!userId) {
//     throw redirect('/login')
//   }

//   const id = params.grade


//   const check_solutions = await db.grade.findUnique({
//     where: { id },
//     select: {
//       name: true,
//       mark: true,
//       status: true,
//       teacher: {
//           include: {
//               subjects: {
//                   include: {
//                       answers: {
//                           where: { positive: true },
//                           select: {
//                               answer: true,
//                               id: true
//                           }
//                       }
//                   }
//               }
//           }
//       },
//       solutions: true
//     }
//   })

//   invariantResponse(check_solutions, 'Class not found', { status: 404 })

//   let new_subjects: any = []

//   check_solutions.solutions.forEach((solution) => {

//     check_solutions.teacher.subjects.forEach((subject) => {

//       if (solution.questionId === subject.id) {

//           // subject.answers.forEach((answer) => {

//             new_subjects.push({
//               subject,
//               solution
//             })

//               // if (answer.id === solution.answerId) {

//               //     const question = solution.questionId

//               //     const answers = subject.answers

//               //     const correct_answer = answer.id

//               //     new_solutions.push({
//               //         question,
//               //         answers,
//               //         correct_answer
//               //     })

//               // }

//           // })

//       }

//     })

//   })

//   const new_grade = {
//     name: check_solutions.name,
//     mark: check_solutions.mark,
//     status: check_solutions.status
//   }

//   // console.log(new_solutions)
  
//   return json({
//     new_grade,
//     new_subjects
//   })
// }
import { redirect, type MetaFunction, LoaderFunctionArgs, json, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { db } from "#app/utils/db.server.ts";
import { convertMsToTime, runCodeC, useIsTabVisible } from "#app/utils/functions.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { getUserCookieId, getUserCookieType } from "#app/utils/session.server.ts";
import { useEffect, useRef, useState } from "react";
import { Select } from "#app/components/ui/Select.tsx";
import { Textarea } from "#app/components/ui/Textarea.tsx";
import { EditorContainer } from "#app/components/EditorContainer.tsx";
import { Container } from "#app/components/ui/Container.tsx";
import { Card } from "#app/components/Card.tsx";
import { InfoElem } from "#app/components/ui/InfoElem.tsx";
import { icons, status_values_file, type_user_list } from "#app/utils/list.values.ts";
import { Icon } from "#app/components/ui/Icon.tsx";
import { Former } from "#app/components/Former.tsx";
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

  const id = params.grade

  let check_grade = await db.grade.findUnique({
    where: { id },
    include: {
        solutions: true,
        teacher: {
            include: {
                subjects: {
                    include: {
                        answers: true
                    }
                }
            }
        }
    }
  })

  const results: any = []
  const solution_status: any = []

  let free_points = 100

  check_grade?.solutions.forEach((solution) => {

    check_grade.teacher.subjects.forEach((subject, key) => {

        if (solution.questionId === subject.id) {

          solution_status.push(solution.status)

            free_points -= parseInt(subject.score)
            
            const new_format_solutions: any = []

            if (subject.requirement_type === 'grid') {

                subject.answers.forEach((answer) => {
                    new_format_solutions.push({
                        value: answer.id,
                        text: answer.answer,
                        color: answer.positive
                    })
                })
            }
                
            results.push({
              id_solution: solution.id,
              subject,
              new_format_solutions,
              solution
            })
        }

    })

  })

  invariantResponse(check_grade, 'Grade not found', { status: 404 })
  
  return json({
    check_grade,
    results,
    free_points,
    typeUser
  })
}

export default function Solutions() {
    
  const loaderData = useLoaderData<typeof loader>()

  const navigate = useNavigate()
  const [toNavigate, setToNavigate] = useState(false)

  useEffect( () => {
    
    if (toNavigate) {
      navigate(-1)
    }

  }, [toNavigate])

  return (
    <Container
        children={
          <Former
            heading="Date Test"
            submit="Salveaza"
            children={
              <>
                <NavigateButton action_func={() => setToNavigate(!toNavigate)} />
                <Card
                  items={
                    <>
                      <InfoElem 
                        icon={<Icon value={icons.spy} />} 
                        label="Suspect de copiat" 
                        item={
                          loaderData.check_grade.status?.includes('suspicious_test') ?
                            loaderData.check_grade.suspicious_hours?.split(',')?.map((hour) => (
                              <span className="p-1 mx-1 bg-red-400 rounded-lg shadow">{hour}</span>
                            )) : <span className="p-1 mx-1 bg-green-400 rounded-lg shadow">NU</span>
                        } 
                      />
                    </>
                  }
                />
                {loaderData.results.map((result, key) => (

                  <Card
                      items={
                          <>
                            {(loaderData.typeUser === type_user_list.teacher || loaderData.typeUser === type_user_list.admin_institution || loaderData.typeUser === type_user_list.admin) &&
                              <InfoElem 
                                icon={<Icon value={icons.bug} />} 
                                label="Status" 
                                item={
                                    result.solution.status.split(',')?.map((stat) => {

                                      return (
                                        <span 
                                          className={`
                                            p-1 mx-1 rounded-lg shadow
                                            ${stat === status_values_file.error_file || stat === status_values_file.term_incomplete || stat === status_values_file.bad_test || stat === '' ? 'bg-red-400' : stat === status_values_file.term_complete || stat === status_values_file.good_test ? 'bg-green-400' : null}
                                          `}
                                        >
                                          {
                                            stat === status_values_file.bad_test ?
                                              'Eroare Test' :
                                              stat === status_values_file.term_incomplete ?
                                                'Termen Lipsa' :
                                                stat === status_values_file.error_file || stat === '' ?
                                                  'Eroare Compilare' :
                                                  stat === status_values_file.term_complete ?
                                                    'Termen Gasit' : 
                                                    status_values_file.good_test ? 
                                                      'Test Reusit' : null
                                          }
                                        </span>
                                      )
                                    })
                                } 
                              />
                            }
                              <InfoElem icon={<Icon value={icons.points} />} label="Puncte" item={(result.solution.mark !== '' ? result.solution.mark : '0') + ' / ' + result.subject.score} />
                              <InfoElem icon={<Icon value={icons.question} />} label="Cerinta" item={result.subject.requirement} />

                              {result.subject.requirement_type === 'code' && (
                                  <>
                                      <InfoElem icon={<Icon value={icons.answer_subject} />} label="Date intrare" item={result.subject.input_data} />
                                      <InfoElem icon={<Icon value={icons.answer_subject} />} label="Date iesire" item={result.subject.output_data} />

                                      {result.subject.restrict_and_specs && result.subject.restrict_and_specs !== '' && 
                                          <InfoElem 
                                              icon={<Icon value={icons.answer_subject} />} 
                                              label="Restrictii" 
                                              item={
                                                  result.subject.restrict_and_specs?.split(",").map((rs) => (
                                                      <span className="p-1 mx-1 bg-red-400 rounded-lg shadow">{rs}</span>
                                                  ))} 
                                          />
                                      }

                                      <InfoElem 
                                          icon={<Icon value={icons.answer_subject} />} 
                                          label="Exemplu" 
                                          item={
                                              <>
                                                  <span className="p-1 mx-1 bg-red-400 rounded-lg shadow">Date intrare: {result.subject.example.split(',')[0].split('in: ')[1].split('out: ')[0]}</span>
                                                  <span className="p-1 mx-1 bg-red-400 rounded-lg shadow">Date iesire: {result.subject.example.split(',')[0].split('in: ')[1].split('out: ')[1]}</span>
                                              </>
                                          } 
                                      />

                                      {result.subject.explanation && result.subject.explanation !== '' && 
                                          <InfoElem 
                                              icon={<Icon value={icons.answer_subject} />} 
                                              label="Explicatie" 
                                              item={result.subject.explanation} 
                                          />
                                      }
                                  </>
                              )}

                              {
                                  result.subject.requirement_type === 'grid' ? (
                                      <Select
                                          options={result.new_format_solutions}
                                          name={`field_${result.id_solution}`}
                                          label="Selecteaza raspuns"
                                          defaultValue={result.solution.answerId}
                                          icon={<Icon value={icons.select} />}
                                          isError=""
                                          disabled={true}
                                      />
                                  ) : result.subject.requirement_type === 'write' ? (
                                      <Textarea
                                          name={`field_${result.id_solution}`}
                                          placeholder=""
                                          defaultValue=""
                                          icon=""
                                          isError=""
                                          style=""
                                      />
                                  ) : result.subject.requirement_type === 'code' ? (
                                      <div className="bg-gray-200 p-4 rounded-lg">
                                        <pre className="whitespace-pre-wrap">
                                          <code className="text-gray-800">
                                            {result.solution.answerContent}
                                          </code>
                                        </pre>
                                      </div>
                                  ) : null
                              }
                          </>
                      }
                  />

                ))}
              </>
            }
          />
        }
    />
  );
}

