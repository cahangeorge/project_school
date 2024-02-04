import { c_structures, icons } from "#app/utils/list.values.ts"
import { useState } from "react"
import { Select } from "./ui/Select.tsx"
import { Icon } from "./ui/Icon.tsx"

type Textarea = {
    name: string,
    placeholder: string,
    defaultValue: string | undefined,
    isError: string | undefined | null,
    style: string,
    variables: any,
    setVariables: any
}

export const Structures = (
    { name, placeholder, defaultValue, isError, variables, setVariables } : Textarea
) => {
    // const [variables, setVariables] = useState<any>([])
    const [value, setValue] = useState("")

    function addVariable() {
        // console.log(value)
        setVariables([...variables, value])
        // console.log(variables)
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
                    <Select
                        options={[
                            { value: c_structures.if, text: c_structures.if },
                            { value: c_structures.else, text: c_structures.else },
                            { value: c_structures.switch, text: c_structures.switch },
                            { value: c_structures.case, text: c_structures.case },
                            { value: c_structures.default, text: c_structures.default },
                            { value: c_structures.while, text: c_structures.while },
                            { value: c_structures.do, text: c_structures.do },
                            { value: c_structures.for, text: c_structures.for },
                            { value: c_structures.continue, text: c_structures.continue },
                            { value: c_structures.break, text: c_structures.break },
                        ]}
                        name="types_condition_choose"
                        label="Structura"
                        defaultValue={null}
                        icon=""
                        isError={null}
                        disabled={false}
                        style="mx-2"
                        setSecondValue={setValue}
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