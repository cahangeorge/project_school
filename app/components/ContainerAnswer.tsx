import { Form } from "@remix-run/react"
import { useState } from "react"

export const ContainerAnswer = (
    { answer } : {
        answer: any
    }
) => {
    const [show, setShow] = useState(false)

    return (
        <div className="p-3 my-3 mx-6 rounded-3xl w-auto border-2 border-white border-dashed space-y-3">
            <Form method="post">
                <p className="">Solutie: <span className="p-0.5">{answer.answer}</span></p>
                <p className="">Valoare: <span className="p-0.5">{answer.positive ? 'Adevarat' : "Fals"}</span></p>
                <div className="flex justify-end items-center mt-3">
                    <button type="submit" name="edit_solution" className="border border-white border-dashed hover:border-solid hover:cursor-pointer p-1.5 m-1.5 hover:shadow rounded-xl text-base">Editeaza</button>
                    <button type="submit" name="delete_solution" className="border border-white border-dashed hover:border-solid hover:cursor-pointer p-1.5 m-1.5 hover:shadow rounded-xl text-base">Sterge</button>
                </div>
            </Form>
        </div>
    )
}