import { Form, Link } from "@remix-run/react"
import { useState } from "react"
import { Icon } from "./ui/Icon.tsx"
import { icons } from "#app/utils/list.values.ts"

export const SectionWithForm = (
    { title, submit, valueSubmit, navigation, childrenInForm, children, content, create_test, to_subjects } : {
        title: string,
        submit: string | Element | null,
        valueSubmit: string | undefined,
        navigation: any,
        childrenInForm: any,
        children: any,
        content: boolean,
        create_test?: string | null,
        to_subjects?: boolean
    }
) => {
    const [showContent, setShowContent] = useState(content)
    
    return (
        <div className="my-3 w-full">
            <div className="flex items-center justify-between border-2 border-white border-dashed py-4 px-6 mx-auto mb-3 text-white shadow-md rounded-xl backdrop-blur-xl w-[75%] bg-sky-600/20">
                <h2 className="text-2xl">{title}</h2>
                <div className="flex items-center space-x-4">
                    {
                        submit && <Form method="post">
                            {childrenInForm}
                            <button
                                type="submit"
                                value={valueSubmit}
                                name="submit_button"
                                disabled={navigation === 'submitting' ? true : false}
                                className="
                                    border-2 border-dashed border-white hover:border-solid
                                    relative
                                    shadow-md 
                                    text-white 
                                    rounded-xl
                                    p-3
                                "
                            >
                                {submit}
                            </button>
                        </Form>
                    }
                    {create_test && (
                        <Link to={'/test/create/' + create_test} className="border-2 border-dashed border-white hover:border-solid
                        relative
                        shadow-md 
                        text-white 
                        rounded-xl
                        p-3">
                            <Icon value={icons.draft_file} />
                        </Link>
                    )}
                    {to_subjects && (
                        <Link to={'/teacher/subjects'} className="border-2 border-dashed border-white hover:border-solid
                        relative
                        shadow-md 
                        text-white 
                        rounded-xl
                        p-3">
                            <Icon value={icons.folder_open} />
                        </Link>
                    )}
                    {/* {content &&  */}
                        <button
                            type="button"
                            onClick={() => setShowContent(!showContent)}
                            name="submit_button"
                            className="
                                border-2 border-dashed border-white hover:border-solid
                                relative
                                shadow-md 
                                text-white 
                                rounded-xl
                                p-3
                            "
                        >
                            <Icon value={showContent ? icons.up_arrow : icons.down_arrow} />
                        </button>
                    {/* } */}
                </div>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${showContent ? 'h-auto opacity-100' : 'h-0 opacity-0'} transition-all transform duration-300 ease-in-out overflow-hidden`}>
                {children}
            </div>
        </div>
    )
}