import { Form } from "@remix-run/react"
import { useState } from "react"

type Section = {
    title: string,
    submit: string | null,
    valueSubmit: string | undefined,
    childrenInForm: any,
    children: any
}

export const SectionForSubjects = (
    { title, submit, valueSubmit, childrenInForm, children } : Section
) => {
    const [show, setShow] = useState(false)

    return (
        <div className="my-5 w-full">
            <h2 className="border-2 border-white border-dashed p-3 mx-3 mb-5 text-white bg-transparent shadow-md rounded-3xl backdrop-blur-sm text-2xl w-[75%] relative">
                {title}
                <span onClick={() => setShow(!show)} className="border border-white border-dashed hover:border-solid hover:cursor-pointer p-1.5 hover:shadow rounded-xl absolute top-2.5 right-5 text-base">{show ? "Restrange" : "Extinde"}</span>
            </h2>
            <div className={`flex flex-col items-start overflow-y-hidden backdrop-blur-sm text-white ${show ? 'h-full' : 'h-0'}`}>
                {
                    submit && <Form method="post">
                        {childrenInForm}
                        <button
                            type="submit"
                            value={valueSubmit}
                            name="submit_button"
                            className="
                                bg-transparent 
                                border-2 border-dashed border-white hover:border-solid
                                backdrop-blur-sm
                                shadow-md 
                                text-white 
                                rounded-3xl
                                p-3
                                mx-6 my-6
                                text-sm
                            "
                        >
                            {submit}
                        </button>
                    </Form>
                }
                {children}
            </div>
        </div>
    )
}