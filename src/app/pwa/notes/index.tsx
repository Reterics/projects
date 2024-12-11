'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Table from '@tiptap/extension-table'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
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
      <td><strong>Firstname</strong></td>
      <td><strong>Lastname</strong></td>
      <td><strong>Lastname</strong></td>
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

    const buttonClass = (isActive?: boolean, icon?:boolean) => {
        const textSize = (!icon ? "  text-lg" : "")
        if (!isActive) {
            return "p-0 px-2 cursor-pointer" + textSize;
        } else {
            return "p-0 px-2 cursor-pointer text-lg font-bold bg-gray-200 border rounded-md" + textSize;
        }
    };

    return (
        <div className="w-full flex flex-row flex-wrap">
            <button
                className={buttonClass(false, true) + " pi pi-undo"}
                onClick={() => editor.chain().focus().undo().run()}>

            </button>
            <button
                className={buttonClass(false, true) + " pi pi-refresh border-r-2 border-r-gray-200"}
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
                className={buttonClass(editor.isActive('code'), true) + " pi pi-code"}
            >
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={buttonClass(editor.isActive('codeBlock'), true) + " pi pi-code border rounded"}
            >
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={buttonClass(editor.isActive('blockquote'), true) + " text-2xl mb-[-0.5rem]"}
            >
                &#34;
            </button>

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass(editor.isActive('bulletList'), true) + " pi pi-list"}
            >
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={buttonClass(editor.isActive('orderedList'), true) + " pi pi-list-check"}
            >
            </button>
            <button
                onClick={() => editor.chain().focus().insertContent(tableHTML, {
                    parseOptions: {
                        preserveWhitespace: false,
                    },
                }).run()}
                className={buttonClass(false, true) + " pi pi-table"}
            >
            </button>


            <select
                className={buttonClass(false, true)}

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
                className={buttonClass(false, true)}
                onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                HR
            </button>
            <button
                className={buttonClass(false, true)}
                onClick={() => editor.chain().focus().setHardBreak().run()}>
                BR
            </button>
            <button
                className={buttonClass(false, true) + ' pi pi-eraser'}
                onClick={() => editor.chain().focus().unsetAllMarks().run()}>
                marks
            </button>
            <button
                className={buttonClass(false, true) + ' pi pi-eraser'}

                onClick={() => editor.chain().focus().clearNodes().run()}>
                nodes
            </button>
        </div>
    )
}

export default function Notes({content}: Readonly<NoteProps>) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Table.configure({
                resizable: true,
            }),
            TableHeader,
            TableRow,
            TableCell
        ],
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

