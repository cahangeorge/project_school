import { useState } from "react"
import { Select } from "./ui/Select.tsx"
import { Input } from "./ui/Input.tsx"
import { c_data_types, c_type_modifiers, icons } from "#app/utils/list.values.ts"
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

export const TypeVariables = (
    { name, placeholder, defaultValue, isError, variables, setVariables } : Textarea
) => {
    const [variablesModified, setVariablesModified] = useState<any>(defaultValue?.split(',') || [])
    // console.log(variablesModified)
    const [value, setValue] = useState("")

    const [chooseVariable, setChooseVariable] = useState("")
    const [chooseVariableType, setChooseVariableType] = useState("")
    const [chooseVariableTypeModifier, setChooseVariableTypeModifier] = useState("")

    function addModifier() {
        // console.log(value)
        setVariablesModified([...variablesModified, chooseVariableTypeModifier + ' ' + chooseVariableType + ' ' + chooseVariable])
        // console.log(variables)
        setValue('')
    }

    function deleteRestriction(value: any) {
        const new_variables = variablesModified.filter((item:any) => item !== value)

        setVariablesModified([...new_variables])
    }

    const new_variables = []

    variables.forEach((item: any) => {
        new_variables.push({ value: item, text: item })
    })

    return (
        <div className="relative w-full">
            <input type="hidden" name={name} defaultValue={variablesModified} />
            <label className="ml-3 text-base">{placeholder}</label>
            <div className="mt-3 flex flex-col">
                <div className="flex ">
                    {variablesModified?.map((item: any) => (
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
                            { value: c_data_types.int, text: c_data_types.int },
                            { value: c_data_types.float, text: c_data_types.float },
                            { value: c_data_types.double , text: c_data_types.double },
                            { value: c_data_types.char, text: c_data_types.char },
                            { value: c_data_types.bool, text: c_data_types.bool },
                        ]}
                        name="variables_type"
                        label="Tip variabila"
                        defaultValue={null}
                        icon=""
                        isError={null}
                        disabled={false}
                        style="mx-2"
                        setSecondValue={setChooseVariableType}
                    />
                    <Select
                        options={[
                            { value: c_type_modifiers.short, text: c_type_modifiers.short },
                            { value: c_type_modifiers.long, text: c_type_modifiers.long },
                            { value: c_type_modifiers.signed, text: c_type_modifiers.signed },
                            { value: c_type_modifiers.unsigned, text: c_type_modifiers.unsigned },
                        ]}
                        name="variables_type_modifiers"
                        label="Modificator tip"
                        defaultValue={null}
                        icon=""
                        isError={null}
                        disabled={false}
                        style="mx-2"
                        setSecondValue={setChooseVariableTypeModifier}
                    />
                    <button 
                        type="button" 
                        onClick={() => addModifier()} 
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