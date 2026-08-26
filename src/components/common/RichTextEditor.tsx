import { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Eraser } from 'lucide-react';
import { sanitizeRichTextHtml } from '../../utils/richText';

interface RichTextEditorProps {
    value?: string;
    onChange: (value: string) => void;
    label: string;
    placeholder?: string;
    disabled?: boolean;
}

export function RichTextEditor({
    value = '',
    onChange,
    label,
    placeholder,
    disabled = false,
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const sanitizedValue = sanitizeRichTextHtml(value);
        if (editor.innerHTML !== sanitizedValue) {
            editor.innerHTML = sanitizedValue;
        }
    }, [value]);

    const updateValue = () => {
        const editor = editorRef.current;
        if (!editor) return;
        onChange(sanitizeRichTextHtml(editor.innerHTML));
    };

    const runCommand = (command: string) => {
        if (disabled) return;
        const editor = editorRef.current;
        if (!editor) return;

        editor.focus();
        document.execCommand(command, false);
        updateValue();
    };

    const clearFormatting = () => {
        if (disabled) return;
        const editor = editorRef.current;
        if (!editor) return;

        const plainText = editor.innerText || '';
        editor.textContent = plainText;
        updateValue();
    };

    const toolbarButtonClass =
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-neon-pink hover:text-neon-pink disabled:cursor-not-allowed disabled:opacity-50';

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3">
                    <button type="button" onClick={() => runCommand('bold')} className={toolbarButtonClass} disabled={disabled} title="Bold">
                        <Bold className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => runCommand('italic')} className={toolbarButtonClass} disabled={disabled} title="Italic">
                        <Italic className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => runCommand('underline')} className={toolbarButtonClass} disabled={disabled} title="Underline">
                        <Underline className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => runCommand('insertUnorderedList')} className={toolbarButtonClass} disabled={disabled} title="Bullet list">
                        <List className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => runCommand('insertOrderedList')} className={toolbarButtonClass} disabled={disabled} title="Numbered list">
                        <ListOrdered className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={clearFormatting} className={toolbarButtonClass} disabled={disabled} title="Clear formatting">
                        <Eraser className="h-4 w-4" />
                    </button>
                </div>

                <div
                    ref={editorRef}
                    contentEditable={!disabled}
                    suppressContentEditableWarning
                    onInput={updateValue}
                    onBlur={updateValue}
                    data-placeholder={placeholder || 'Write the detailed product description here...'}
                    className="min-h-[220px] w-full bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1"
                />
            </div>
            <p className="mt-2 text-xs text-slate-500">
                Use basic formatting for long-form product details, benefits, and structured content.
            </p>
        </div>
    );
}
