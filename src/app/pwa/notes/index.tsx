'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {Editor} from "@tiptap/core";
import './style.scss';

export interface NoteProps {
    content: string
}

export interface NoteMenuProps {
    editor: Editor | null
}

export const tableHTML = `
  <table style="width:100%">
    <tr>
      <th>Firstname</th>
      <th>Lastname</th>
      <th>Age</th>
    </tr>
    <tr>
      <td>Jill</td>
      <td>Smith</td>
      <td>50</td>
    </tr>
    <tr>
      <td>Eve</td>
      <td>Jackson</td>
      <td>94</td>
    </tr>
    <tr>
      <td>John</td>
      <td>Doe</td>
      <td>80</td>
    </tr>
  </table>
`

export function NoteMenu({ editor }: Readonly<NoteMenuProps>) {
    if (!editor) return null;

    const buttonClass = (isActive?: boolean) => !isActive ?
        "p-1 px-2 cursor-pointer" : "p-1 px-2 cursor-pointer font-bold bg-gray-200 border rounded-md";
    return (
        <div className="w-full flex flex-row flex-wrap">
            <button
                className={buttonClass() + " pi pi-undo"}
                onClick={() => editor.chain().focus().undo().run()}>

            </button>
            <button
                className={buttonClass() + " pi pi-refresh"}
                onClick={() => editor.chain().focus().redo().run()}>

            </button>
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={buttonClass(editor.isActive('bold'))}
            >
                B
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={buttonClass(editor.isActive('italic')) + " italic"}
            >
                I
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={buttonClass(editor.isActive('strike')) + " line-through"}
            >
                S
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={buttonClass(editor.isActive('code')) + " pi pi-code"}
            >
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={buttonClass(editor.isActive('codeBlock')) + " pi pi-code border rounded"}
            >
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={buttonClass(editor.isActive('blockquote'))}
            >
                Quote
            </button>

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass(editor.isActive('bulletList')) + " pi pi-list"}
            >
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={buttonClass(editor.isActive('orderedList')) + " pi pi-list-check"}
            >
            </button>
            <button
                onClick={() => editor.chain().focus().insertContent(tableHTML, {
                    parseOptions: {
                        preserveWhitespace: false,
                    },
                }).run()}
                className={buttonClass() + " pi pi-table"}
            >
            </button>


            <select
                className={buttonClass()}

                onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'paragraph') {
                        editor.chain().focus().setParagraph().run();
                    } else {
                        editor.chain().focus().toggleHeading({level: Number(value) as 1|2|3|4|5|6}).run();
                    }
                }}
                value={
                    editor.isActive('paragraph') ? 'paragraph' : Array.from({length: 6}, (_, i) => i + 1).find((lvl) => editor.isActive('heading', {level: lvl})) ?? ''
                }
            >
                <option value="paragraph">Paragraph</option>
                {[...Array(6)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{`H${i + 1}`}</option>
                ))}
            </select>
            <button
                className={buttonClass()}
                onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                HR
            </button>
            <button
                className={buttonClass()}
                onClick={() => editor.chain().focus().setHardBreak().run()}>
                BR
            </button>
            <button
                className={buttonClass() + ' pi pi-eraser'}
                onClick={() => editor.chain().focus().unsetAllMarks().run()}>
                marks
            </button>
            <button
                className={buttonClass() + ' pi pi-eraser'}

                onClick={() => editor.chain().focus().clearNodes().run()}>
                nodes
            </button>
        </div>
    )
}

export default function Notes({content}: Readonly<NoteProps>) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        editorProps: {
            attributes: {
                spellcheck: 'false',
            },
        },
    })

    return <div className='flex flex-col h-full p-1'>
        <NoteMenu editor={editor}/>
        <EditorContent editor={editor} className='h-full'/>
    </div>
}

