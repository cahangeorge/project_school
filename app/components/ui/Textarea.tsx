type Textarea = {
    name: string,
    placeholder: string,
    defaultValue: string | undefined,
    icon: any,
    isError: string | undefined | null,
    style: string
}

export const Textarea = (
    { name, placeholder, defaultValue, icon, isError } : Textarea
) => {

    return (
        <div className="relative w-full">
            {placeholder !== '' && <label className="ml-3 text-base">{placeholder}</label>}
            {/* <div className="relative mt-3"> */}
                <textarea 
                    name={name}
                    className="w-full bg-transparent outline-none border-2 border-dashed border-white rounded-xl text-white text-sm mt-3 py-3 px-5 shadow-md placeholder:text-white transition-all ease-in-out duration-300 hover:border-solid"
                >
                    {defaultValue}
                </textarea>
                {/* <button type="button" onClick={() => null} className="absolute top-2 right-4 border border-white border-dashed hover:border-solid hover:cursor-pointer shadow p-1.5 rounded-xl bg-gray-400 backdrop-blur-sm">Adauga valoare</button>
            </div> */}
            {isError &&
                <p className="border-2 border-dotted border-white bg-red-500/[0.5] shadow-md py-1 px-3 m-2 rounded-2xl text-xs">{isError}</p>
            }
        </div>
    )
}