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
import { icons } from "#app/utils/list.values.ts";
import { Icon } from "#app/components/ui/Icon.tsx";

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

  let free_points = 100

  check_grade?.solutions.forEach((solution) => {

    check_grade.teacher.subjects.forEach((subject, key) => {

        if (solution.questionId === subject.id) {

            free_points -= parseInt(subject.score)
            
            const new_format_solutions: any = []

            if (subject.requirement_type === 'grid') {

                subject.answers.forEach((answer) => {
                    new_format_solutions.push({
                        value: answer.id,
                        text: answer.answer
                    })
                })
            }
                
            results.push({
                id_solution: solution.id,
                subject,
                new_format_solutions
            })
        }

    })

  })

  invariantResponse(check_grade, 'Grade not found', { status: 404 })
  
  return json({
    check_grade,
    results,
    free_points
  })
}

export const action = async ({ request, params } : ActionFunctionArgs) => {

  const userId = await getUserCookieId(request)
  const userType = await getUserCookieType(request)

  const id = params.grade

  const check_grade = await db.grade.findUnique({
    where: { id },
    select: {
        solutions: {
            select: {
                id: true
            }
        }
    }
  })
  
  const form = await request.formData()

  const suspicious_hours = form.get("suspicious_hours")
  let status_grade = ''

  if (suspicious_hours !== '') {
    status_grade += 'suspicious_test'
  }

  const all_answers: any = []

  check_grade?.solutions.forEach((solution) => {
    const get_field = form.get(`field_${solution.id}`)

    // console.log(get_field, solution.id)

    if (get_field !== null) {
        all_answers.push({
            id: solution.id,
            field: get_field
        })
    }
  })

  let grade_mark = 0

  let results = null

//   console.log(all_answers)
//   return null

  all_answers.forEach( async (answer) => {

    const get_solution = await db.solution.findUnique({
        where: { id: answer.id },
        select: {
            questionId: true
        }
    })

    const get_subject = await db.grade.findUnique({
        where: { id: params.grade },
        select: {
            teacher: {
                select: {
                    subjects: {
                        where: {
                            id: get_solution?.questionId
                        },
                        select: {
                            requirement_type: true,
                            variables: true,
                            variables_modified: true,
                            structures: true,
                            restrict_and_specs: true,
                            example: true,
                            score: true,
                            answers: {
                                where: {
                                    positive: true
                                },
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    // console.log('yes')

    if (get_subject?.teacher.subjects[0].requirement_type === 'grid') {
        const answerIsCorrect = get_subject?.teacher.subjects[0].answers[0]?.id === answer.field

        const setMark = answerIsCorrect ? get_subject?.teacher.subjects[0].score : '0'

        grade_mark += parseInt(setMark)

        await db.solution.update({
            where: { id: answer.id },
            data: {
                answerId: answer.field,
                mark: setMark,
                status: answerIsCorrect ? 'good_test' : 'bad_test',
                completed: true
            }
        })
    } else {
        results = await runCodeC({
            id: answer.id,
            data: answer.field,
            example: get_subject?.teacher.subjects[0].example,
            variables: get_subject?.teacher.subjects[0].variables,
            variables_modified: get_subject?.teacher.subjects[0].variables_modified,
            structures: get_subject?.teacher.subjects[0].structures,
            restrict_and_specs: get_subject?.teacher.subjects[0].restrict_and_specs
        })

        const setMark = get_subject?.teacher.subjects[0].score

        // grade_mark += parseInt(setMark)

        await db.solution.update({
            where: { id: answer.id },
            data: {
                answerContent: answer.field,
                mark: '',
                status: '',
                completed: true
            }
        })
    }

    await db.grade.update({
        where: { id: params.grade },
        data: {
            mark: grade_mark + '',
            completed: true,
            status: status_grade,
            suspicious_hours: suspicious_hours
        }
    })

  })

  return json(
      {
        updated: true,
        results
      }, 
      { status: 200 }
  )
}

export default function CreateTest() {

    const isVisible = useIsTabVisible()

    const [historyControl, setHistoryControl] = useState([])

    const submit = useSubmit()
    
    const buttonRef = useRef(null);
    
  const loaderData = useLoaderData<typeof loader>()

  const actionData = useActionData<typeof action>()

  const navigate = useNavigate()

  const [timeLeft, setTimeLeft] = useState('00:00')

  const updateTime = async () => {
    const limit_time = new Date(loaderData.check_grade.timeToResolve)
    const newTime = new Date()

    const time_left = limit_time.getTime() - newTime.getTime()

    const converted_time = convertMsToTime(time_left)

    if (converted_time.hours <= 0 && converted_time.minutes <= 0 && converted_time.seconds <= 0) {

        // buttonRef?.current?.click();
    }

    setTimeLeft(converted_time.time);
  };

  useEffect( () => {

    // console.log(isVisible)
    
    if (actionData?.updated) {
        console.log(actionData.results)
      navigate(-1)
    }

    setInterval(updateTime, 1000)

    if (!isVisible) {
        setHistoryControl([...historyControl, timeLeft])
    }

  }, [actionData, isVisible])

  return (
    <Container
        children={
            <div className="
                w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%] 
                bg-transparent 
                border-4 border-dashed border-white
                backdrop-blur-xl
                shadow-md 
                text-white 
                rounded-xl
                p-6
                my-10
            ">
                <Form 
                    method="post" 
                    onSubmit={(event) => {
                        submit(event.currentTarget)
                    }}
                    className="flex flex-col items-center relative"
                >   

                    <input type="hidden" name="suspicious_hours" defaultValue={historyControl} />
                    
                    <div className="space-y-16">

                        <div className="absolute left-0 flex justify-between w-full">
                            {/* <p className="border border-white border-dashed p-2 rounded-2xl shadow">{loaderData.free_points} puncte din oficiu</p> */}

                            <p className="border-2 border-white border-dashed p-2 rounded-xl shadow">Timp ramas: {timeLeft}</p>
                        </div>

                        <div className="space-y-6 flex flex-col">
                            <h1 className="text-4xl text-center">Rezolvare Test</h1>

                            {loaderData.results.map((result, key) => (

                                <Card
                                    items={
                                        <>
                                            <InfoElem icon={<Icon value={icons.points} />} label="Puncte" item={result.subject.score} />
                                            
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
                                                        defaultValue=""
                                                        icon={<Icon value={icons.select} />}
                                                        isError=""
                                                        disabled={false}
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
                                                    <EditorContainer 
                                                        result={result}
                                                    />
                                                ) : null
                                            }
                                        </>
                                    }
                                />

                            ))}
                        </div>
                    </div>

                    <button ref={buttonRef} type="submit" className="outline-none rounded-xl p-2 shadow-md bg-transparent border-2 border-white border-dashed text-white text-sm font-semibold transition-all ease-in-out duration-300 hover:border-solid hover:scale-105 my-6">
                        Salveaza
                    </button>
                </Form>
            </div>
        }
    />
  );
}

