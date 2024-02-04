import { useState } from "react"
import { Input } from "./ui/Input.tsx"
import { Icon } from "./ui/Icon.tsx"
import { icons } from "#app/utils/list.values.ts"

type Textarea = {
    name: string,
    placeholder: string,
    defaultValue: string | undefined,
    isError: string | undefined | null,
    style: string,
    variables: any,
    setVariables: any
}

export const Variables = (
    { name, placeholder, defaultValue, isError, variables, setVariables } : Textarea
) => {
    const [value, setValue] = useState("")

    function addVariable() {
        setVariables([...variables, value])
        setValue('')
    }

    function deleteVariable(value: any) {
        const new_variables = variables.filter((item:any) => item !== value)

        setVariables([...new_variables])
    }

    return (
        <div className="relative w-full">
            <input type="hidden" name={name} defaultValue={variables} />
            <label className="ml-3 text-base">{placeholder}</label>
            <div className="mt-3 flex flex-col">
                <div className="flex ">
                    {variables?.map((item: any) => (
                        <div className="p-4 m-2 rounded-2xl shadow border border-white border-dashed hover:border-red-500 hover:bg-red-400 hover:cursor-pointer" onClick={() => deleteVariable(item)}>
                            <var>{item}</var>
                        </div>
                    ))}
                </div>
                <div className="flex items-center">
                    <Input
                        type="string"
                        name=""
                        placeholder=""
                        defaultValue={value}
                        icon=""
                        isError=""
                        style=""
                        change={(e) => setValue(e.target.value)}
                    />
                    <button 
                        type="button" 
                        onClick={() => addVariable()} 
                        className="ml-3 border-2 border-white border-dashed hover:border-solid hover:cursor-pointer shadow p-2 rounded-xl"
                    >
                        <Icon value={icons.add} />
                    </button>
                </div>
            </div>
            {isError &&
                <p className="border-2 border-dotted border-white bg-red-500/[0.5] shadow-md py-1 px-3 m-2 rounded-2xl text-xs">{isError}</p>
            }
        </div>
    )
}