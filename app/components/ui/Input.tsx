
export const Input = (
    { type, name, placeholder, defaultValue, icon, isError, change } : {
        type: string,
        name: string,
        placeholder: string,
        defaultValue: string | undefined,
        icon: any,
        isError: string | undefined | null,
        style: string,
        change: any
    }
) => {
    return (
        <div className="relative w-full min-w-[200px] transition-all ease-in-out duration-300 hover:scale-105">
            <div className="relative">
                <input 
                    type={type}
                    name={name}
                    placeholder={placeholder} 
                    defaultValue={defaultValue}
                    className="w-full bg-transparent outline-none border-2 border-dashed border-white rounded-xl text-white text-sm py-3 pl-5 pr-16 shadow-md placeholder:text-white transition-all ease-in-out duration-300 hover:border-solid"
                    onChange={change}
                />
                {icon &&
                    <span className="text-white absolute inset-y-0 right-0 flex items-center p-2 my-2 mr-4 rounded-xl">
                        {icon}
                    </span>
                }
            </div>
            {isError &&
                <p className="border-2 border-dotted border-white bg-red-500/[0.5] shadow-md py-1 px-3 m-2 rounded-2xl text-xs">{isError}</p>
            }
        </div>
    )
}