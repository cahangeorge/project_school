import { useState } from "react"
import { Select } from "./ui/Select.tsx"
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

export const RestrictVariables = (
    { name, placeholder, defaultValue, isError, variables, setVariables } : Textarea
) => {
    const [restrictions, setRestrictions] = useState<any>(defaultValue?.split(',') || [])
    // console.log(restrictions)
    const [value, setValue] = useState("")

    const [chooseVariable, setChooseVariable] = useState("")
    const [chooseCondition, setChooseCondition] = useState("")
    const [chooseValue, setChooseValue] = useState("")

    function addRestriction() {
        // console.log(value)
        setRestrictions([...restrictions, chooseVariable + ' ' + chooseCondition + ' ' + chooseValue])
        // console.log(variables)
        setValue('')
    }

    function deleteRestriction(value: any) {
        const new_variables = restrictions.filter((item:any) => item !== value)

        setRestrictions([...new_variables])
    }

    const new_variables = []

    variables.forEach((item: any) => {
        new_variables.push({ value: item, text: item })
    })

    return (
        <div className="relative w-full">
            <input type="hidden" name={name} defaultValue={restrictions} />
            <label className="ml-3 text-base">{placeholder}</label>
            <div className="mt-3 flex flex-col">
                <div className="flex ">
                    {restrictions?.map((item: any) => (
                        <div className="p-4 m-2 rounded-2xl shadow border border-white border-dashed hover:border-red-500 hover:bg-red-400 hover:cursor-pointer" onClick={() => deleteRestriction(item)}>
                            <var>{item}</var>
                        </div>
                    ))}
                </div>
                <div className="flex items-center">
                    <Select
                        options={new_variables}
                        name="variables_choose"
                        label="Variabila"
                        defaultValue={null}
                        icon=""
                        isError={null}
                        disabled={false}
                        style="mx-2"
                        setSecondValue={setChooseVariable}
                    />
                    <Select
                        options={[
                            { value: '<', text: '<' },
                            { value: '<=', text: '<=' },
                            { value: '>', text: '>' },
                            { value: '>=', text: '>=' },
                            { value: '=', text: '=' },
                        ]}
                        name="types_condition_choose"
                        label="Conditia"
                        defaultValue={null}
                        icon=""
                        isError={null}
                        disabled={false}
                        style="mx-2"
                        setSecondValue={setChooseCondition}
                    />
                    <input
                        type="number" 
                        value={chooseValue}
                        onChange={(e) => setChooseValue(e.target.value)}
                        className="w-[200px] bg-transparent outline-none border-2 border-dashed border-white rounded-xl text-white text-sm py-3 px-5 shadow-md placeholder:text-white transition-all ease-in-out duration-300 hover:border-solid"
                    />
                    <button 
                        type="button" 
                        onClick={() => addRestriction()} 
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