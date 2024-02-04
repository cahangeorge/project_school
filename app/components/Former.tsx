import { Form } from "@remix-run/react"

type Former = {
    heading: string | null,
    submit: string,
    children: any
}

export const Former = (
    { heading, submit, children } : Former
) => {
    
    return (
        <div className="
            w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%] 
            backdrop-blur-xl
            bg-sky-600/20
            border-4 border-dashed border-white
            shadow-md 
            text-white 
            rounded-xl
            py-10 px-3
            my-10
            mx-auto
            relative
        ">
            <Form method="post" className="flex flex-col items-center space-y-12">
                {heading && <h1 className="text-4xl text-center">{heading}</h1>}

                <div className="space-y-8 max-w-[90%]">
                    {children}
                </div>

                <button 
                    type="submit"
                    className="outline-none rounded-xl p-3 shadow-md bg-transparent border-2 border-white border-dashed text-white tet-sm font-semibold transition-all ease-in-out duration-300 hover:border-solid hover:scale-105"
                >
                    {submit}
                </button>
            </Form>
        </div>
    )
}