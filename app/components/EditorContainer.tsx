import EditorMonaco, { Editor } from '@monaco-editor/react';
import { useState } from 'react';

export const EditorContainer = ({ result }: { result: any }) => {

    const [valueEditor, setValueEditor] = useState("// some content")

    return (
        <div className="rounded-3xl bg-white shadow p-2 w-full">
            <input 
                type="hidden" 
                name={`field_${result.id_solution}`} 
                value={valueEditor}
            />
            <Editor 
                height="45vh" 
                defaultLanguage="cpp" 
                defaultValue={valueEditor}
                onChange={(value) => setValueEditor(value)}
            />
        </div>
    );
}