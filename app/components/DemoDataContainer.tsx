import { useState } from "react"
import { Input } from "./ui/Input.tsx"
import { Icon } from "./ui/Icon.tsx"
import { icons } from "#app/utils/list.values.ts"

type DemoDataContainer = {
    name: string,
    placeholder: string,
    defaultValue: string | undefined,
    icon: any,
    isError: string | undefined | null,
    style: string
}

export const DemoDataContainer = (
    { name, placeholder, defaultValue, icon, isError } : DemoDataContainer
) => {
    const [values, setValues] = useState<any>(defaultValue?.split(',') || [])

    const [inputData, setInputData] = useState()
    const [outputData, setOutputData] = useState()

    const addValue = () => {
        setValues([...values, 'in: ' + inputData + 'out: ' + outputData])
    }

    function deleteValue(value: any) {
        const new_variables = values.filter((item:any) => item !== value)

        setValues([...new_variables])
    }

    return (
        <div className="relative w-full flex flex-col items-start">
            {placeholder !== '' && <label className="ml-3 mb-3 text-base">{placeholder}</label>}
            {/* <div className="relative mt-3"> */}
                <div className="flex ">
                    {values?.map((item: any) => (
                        <div className="p-4 m-2 rounded-2xl shadow border border-white border-dashed hover:border-red-500 hover:bg-red-400 hover:cursor-pointer" onClick={() => deleteValue(item)}>
                            <var>{item}</var>
                        </div>
                    ))}
                </div>
                <input type="hidden" name={name} defaultValue={values} />
                
                <div className="flex items-end w-full">
                    <div className="flex space-x-4 w-full">
                        <Input
                            type="string"
                            name=""
                            placeholder="Data intrare"
                            defaultValue={inputData}
                            icon=""
                            isError=""
                            style=""
                            change={(e) => setInputData(e.target.value)}
                        />
                        <Input
                            type="string"
                            name=""
                            placeholder="Date iesire"
                            defaultValue={outputData}
                            icon=""
                            isError=""
                            style=""
                            change={(e) => setOutputData(e.target.value)}
                        />
                    </div>
                    <button 
                        type="button" 
                        onClick={() => addValue()} 
                        className="ml-3 border-2 border-white border-dashed hover:border-solid hover:cursor-pointer shadow p-2 rounded-xl"
                    >
                        <Icon value={icons.add} />
                    </button>
                </div>
            {isError &&
                <p className="border-2 border-dotted border-white bg-red-500/[0.5] shadow-md py-1 px-3 m-2 rounded-2xl text-xs">{isError}</p>
            }
        </div>
    )
}