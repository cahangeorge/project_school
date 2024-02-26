import { useEffect, useState } from "react";

// Declaring type for Select form
type SelectType = { 
    options: {
        value: string | boolean,
        text: string
    }[],
    name: string,
    label: string,
    defaultValue: string | null | undefined,
    icon: any,
    isError: string | undefined | null,
    disabled: boolean,
    style?: string
}

// Select component
export const SelectSubjects: React.FC<SelectType> = ({
    options,
    name,
    label,
    defaultValue,
    icon,
    isError,
    disabled,
    style
}) => {

    const [showPopup, setShowPopup] = useState(false) // show variants to choose
    const [value, setValue] = useState(defaultValue) // value selected
    const [text, setText] = useState("Selecteaza") // text selected

    const [selectedOptions, setSelectedOptions] = useState<any>(options)
    const [selectedSubjects, setSelectedSubjects] = useState<any>([])

    useEffect(() => {
        const textValue = options.find(item => item.value === defaultValue)?.text

        if (textValue)
            setText(textValue)

        const results: any = []

        selectedSubjects.forEach((item) => {
            results.push(item.valueCategory)
        })

        setValue(results)

    }, [defaultValue, options, selectedSubjects])
 
    const handleSubject = (valueCategory: string, textCategory: string) => { // this function run when is clicked one of list items

        setShowPopup(!showPopup) // change status of popup

        setSelectedSubjects([...selectedSubjects, { valueCategory, textCategory }])

        setSelectedOptions(selectedOptions.filter((item) => item.value !== valueCategory))

    }

    const deleteSubject = (subject: any) => {

        setSelectedSubjects(selectedSubjects.filter((item) => item.valueCategory !== subject.valueCategory))

        setSelectedOptions(options.filter((option) => selectedOptions.some((option_2) => {
            return option.value === option_2.value || option.value === subject.valueCategory
        })))

    }

    return (
        <div className={`relative w-full ${style}`}>
            <input 
                type="hidden" 
                name={name} 
                defaultValue={value}
            />
            <div className="flex flex-col mb-3">
                {selectedSubjects.map((item) => (
                    <p onClick={() => deleteSubject(item)} className="p-3 m-2 rounded-xl shadow border-2 border-white border-dashed hover:border-red-600 hover:bg-red-400 hover:cursor-pointer">
                        {item.textCategory}
                    </p>
                ))}
            </div>
            <div className="relative">
                <button 
                    type="button" 
                    className={`relative z-10 w-full cursor-default rounded-xl bg-transparent py-3 pl-5 pr-16 text-left text-white text-sm shadow-md ring-gray-300 focus:outline-none hover:cursor-pointer placeholder:text-white border-2 ${showPopup ? 'border-solid scale-105' : 'border-dashed'} border-white transition-all ease-in-out duration-300 hover:scale-105 hover:border-solid`}
                    aria-haspopup="listbox" 
                    aria-expanded="true" 
                    aria-labelledby="listbox-label"
                    onClick={() => setShowPopup(!showPopup)}
                    disabled={disabled}
                >
                    <span className="flex items-center justify-between">
                        <span className="block truncate">{value === undefined || value === "" || !value  ? label : text}</span>
                    </span>
                    {icon &&
                        <span className="text-white absolute inset-y-0 right-0 flex items-center p-2 my-2 mr-4 rounded-xl">
                            {icon}
                        </span>
                    }
                </button>

                <ul 
                        className={`
                            ${showPopup ? 'h-auto opacity-100 mt-3 p-2 border-2' : 'h-0 opacity-0 mt-0 p-0 border-0'}
                            max-h-75
                             top-11 right-0 transition-all transform duration-300 ease-in-out
                            w-full overflow-hidden rounded-xl text-base shadow-md border-white border-dashed 
                        `}
                        tabIndex={-1} 
                        role="listbox" 
                        aria-labelledby="listbox-label" 
                        aria-activedescendant="listbox-option-3"
                    >
                        {selectedOptions.map((item, idx) => (
                            <li 
                                className={`text-white text-sm relative cursor-default select-none p-3 m-1 transition-all ease-in-out duration-300 hover:cursor-pointer hover:bg-white/[0.25] rounded-xl ${value == item.value && "bg-white/[0.25]"}`}
                                id="listbox-option-0" 
                                role="option"
                                key={idx}
                                onClick={() => handleSubject(item.value, item.text)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-normal block truncate">{item.text}</span>
                                </div>

                                {value == item.value &&
                                    <span className="text-white absolute inset-y-0 right-0 flex items-center pr-4">
                                        <i className="ri-check-line ri-xl"></i>
                                    </span>
                                }
                            </li>
                        ))}
                    </ul>

                {isError &&
                    <p className="border-2 border-dotted border-white bg-red-500/[0.5] shadow-md py-1 px-3 m-2 rounded-2xl text-xs">{isError}</p>
                }
            </div>
        </div>

    );
}
  