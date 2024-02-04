import { Form } from "@remix-run/react"
import { useState } from "react"

type SectionWithFields = {
    title: string,
    button_show: string,
    childrenInForm: any,
    children: any
}

export const SectionWithFields = (
    { title, button_show, childrenInForm, children } : SectionWithFields
) => {
    const [showForm, setShowForm] = useState(false)

    return (
        <div className="my-20 w-full">
            <h2 className="border-2 border-white border-dashed p-5 mx-3 mb-10 text-white bg-transparent shadow-md rounded-3xl backdrop-blur-sm text-2xl w-[75%]">{title}</h2>
            <div className="flex flex-wrap justify-start items-start">
                {showForm ? (
                    <Form method="post" className="
                        w-[75%]
                        bg-transparent 
                        border-2 border-dashed border-white hover:border-solid
                        backdrop-blur-sm
                        shadow-md 
                        text-white 
                        rounded-3xl
                        py-10 px-5
                        m-3
                        text-sm
                        space-y-5
                        relative
                    ">
                        <button
                            type="button"
                            onClick={() => setShowForm(!showForm)}
                            className="text-2xl absolute right-5 top-3"
                        >
                            x
                        </button>
                        {childrenInForm} 
                        <button
                            type="submit"
                            className="
                                bg-transparent 
                                border-2 border-dashed border-white hover:border-solid
                                backdrop-blur-sm
                                shadow-md 
                                text-white 
                                rounded-3xl
                                py-10 px-5
                                m-3
                                text-sm
                            "
                        >
                            Creeaza
                        </button>
                    </Form>
                ) : (
                    <button
                        type="button"
                        className="
                            w-[300px]
                            bg-transparent 
                            border-2 border-dashed border-white hover:border-solid
                            backdrop-blur-sm
                            shadow-md 
                            text-white 
                            rounded-3xl
                            py-10 px-5
                            m-3
                            text-sm
                        "
                        onClick={() => setShowForm(!showForm)}
                    >
                        {button_show}
                    </button>
                )}
                {children}
            </div>
        </div>
    )
}