import { Form } from "@remix-run/react"

type Former = {
    submit: string,
    children: any
}

export const FormModal = (
    { submit, children } : Former
) => {
    return (
        <div className="
            w-[90%] sm:w-[70%] md:w-[60%] lg:w-[50%] xl:w-[40%] 
            bg-transparent 
            border-2 border-dashed border-white
            backdrop-blur-sm
            shadow-md 
            text-white 
            rounded-3xl
            py-10 px-3
            my-10
        ">
            <Form 
                method="post" 
                className="flex flex-col items-center relative"
            >

                {children}

                <button type="submit" className="outline-none rounded-3xl p-3 shadow-md bg-transparent border-2 border-white border-dotted text-white text-sm font-semibold transition-all ease-in-out duration-300 hover:border-solid hover:scale-105 my-6">
                    {submit}
                </button>
            </Form>
        </div>
    )
}