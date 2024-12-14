'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Table from '@tiptap/extension-table'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import {Editor} from "@tiptap/core";
import './style.scss';
import IDBStore from "@/app/database/stores/IDBStore.ts";
import {useEffect, useRef, useState} from "react";
import {IDBData} from "@/app/database/DBModel.ts";
import { Toast } from 'primereact/toast';

export interface NoteType extends IDBData {
    content: string
    name: string
    excerpt?: string
}

export interface NoteMenuProps {
    editor: Editor | null
    saveNoteAction: (html: string, text: string) => void
}

export const getEmptyNote = (): NoteType => {
    return {
        id: new Date().getTime().toString(),
        content: '<p><strong>Title</strong></p><p>Start editing...</p>',
        name: '',
    }
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

export function NoteMenu({ editor, saveNoteAction }: Readonly<NoteMenuProps>) {
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
                className={buttonClass(false, true) + " pi pi-save border-r-2 border-r-gray-200"}
                onClick={() => saveNoteAction(editor?.getHTML(), editor?.getText())}>
            </button>
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

export function NoteBrowser({notes, setNoteAction}: Readonly<{ notes: NoteType[], setNoteAction: (note: NoteType) => void }>) {
    return <div className='flex flex-col min-w-32 border border-gray-400 p-1'>
        <button
            key={"note_null"}
            className='w-full p-1 border-b-2 border-gray-400'
            onClick={() => setNoteAction(getEmptyNote())}
        >Add</button>
        {notes.map((note) =>
            <button
                key={"note_" + note.id}
                className='w-full p-1 border-b-2 border-gray-200'
                onClick={() => setNoteAction(note)}
            >
                <div className="text-left font-semibold">{note.name}</div>
                <div className="ps-2">{note.excerpt ?? note.content.split('</p>')[0]
                    .replace(/<p>/g, '')
                    .substring(0, 10)}...</div>
            </button>
        )}
    </div>;
}

export function NoteEditor({note, saveNoteAction}: Readonly<{ note: NoteType, saveNoteAction: (note: NoteType) => void }>) {
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
        // content: note.content,
        editorProps: {
            attributes: {
                spellcheck: 'false',
            },
        },
    })

    useEffect(()=> {
        if (editor) {
            editor.commands.setContent(note.content);
        }
    }, [editor, note]);

    return <div className='flex flex-col h-full p-1'>
        <NoteMenu editor={editor} saveNoteAction={(html: string, text)=> {
            note.content = html;
            const lineBreak = text.indexOf("\n");
            note.name = text.substring(0, lineBreak <= 1 ? 10 : lineBreak);
            note.excerpt = text.substring(lineBreak <= 1 ? 10 : lineBreak, 10)
            saveNoteAction(note)
        }}/>
        <EditorContent editor={editor} className='h-full'/>
    </div>
}

export default function Notes() {
    const [notes, setNotes] = useState<NoteType[]>([]);
    const [note, setNote] = useState<NoteType>(getEmptyNote());
    const store = useRef(new IDBStore({
        tables: ['notes']
    }));
    const toast = useRef<Toast|null>(null);

    useEffect(() => {
        if(store.current) {
            store.current.load().then(()=> {
                setNotes(store.current.getAll('notes').toReversed() as NoteType[])
            })
        }
    }, []);

    const saveNoteAction = async (note: NoteType) => {
        if (!store.current) {
            throw new Error('IDBStore is undefined');
        }

        if (store.current.get(note.id, 'notes')) {
            await store.current.update(note, 'notes');
        } else {
            await store.current.push(note, 'notes');
        }
        console.error(store.current.getAll('notes').toReversed())
        setNotes(store.current.getAll('notes').toReversed() as NoteType[]);

        toast.current?.show({ severity: 'info', summary: 'Info', detail: 'Note Saved' });
    }

    return <div className='flex flex-row h-full'>
        <NoteBrowser notes={notes} setNoteAction={setNote}></NoteBrowser>
        <NoteEditor note={note} saveNoteAction={saveNoteAction}></NoteEditor>
        <Toast ref={toast} />
    </div>
}

