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
import DBModel, {IDBData} from "@/app/database/DBModel.ts";
import { toast } from 'react-toastify';
import {FirebaseStore} from "@/app/database/stores/FirebaseStore.ts";
import {
    BsArrow90DegLeft, BsArrow90DegRight, BsArrowRepeat,
    BsCode,
    BsCodeSquare, BsFileBreak, BsFloppy, BsHr,
    BsListOl,
    BsListUl, BsPlusLg,
    BsQuote, BsTable, BsTrash, BsType,
    BsTypeBold, BsTypeH1, BsTypeH2, BsTypeH3, BsTypeH4, BsTypeH5, BsTypeH6,
    BsTypeItalic,
    BsTypeStrikethrough
} from "react-icons/bs";
import Dropdown from "@/app/components/Dropdown.tsx";

export interface NoteType extends IDBData {
    content?: string
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
        updated: new Date().getTime()
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
            return "p-2 cursor-pointer hover:bg-gray-200" + textSize;
        } else {
            return "p-2 cursor-pointer text-lg font-bold bg-gray-200 border rounded-md" + textSize;
        }
    };

    const paragraphOptions = [
        { value: "paragraph", icon: <BsType />, label: "Paragraph" },
        { value: "1", icon: <BsTypeH1 />, label: "Heading 1" },
        { value: "2", icon: <BsTypeH2 />, label: "Heading 2" },
        { value: "3", icon: <BsTypeH3 />, label: "Heading 3" },
        { value: "4", icon: <BsTypeH4 />, label: "Heading 4" },
        { value: "5", icon: <BsTypeH5 />, label: "Heading 5" },
        { value: "6", icon: <BsTypeH6 />, label: "Heading 6" },
    ];

    return (
        <div className="w-full flex flex-row flex-wrap border-b border-zinc-400">
            <button
                className={buttonClass(false, true) + " border-r-2 border-r-gray-200"}
                onClick={() => saveNoteAction(editor?.getHTML(), editor?.getText())}>
                <BsFloppy/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={buttonClass(editor.isActive('bold'))}
            >
                <BsTypeBold/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={buttonClass(editor.isActive('italic'))}
            >
                <BsTypeItalic/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={buttonClass(editor.isActive('strike'))}
            >
                <BsTypeStrikethrough/>
            </button>
            <Dropdown
                className={buttonClass(false, true) + " border-r-2 border-r-gray-200"}
                options={paragraphOptions}
                value={
                    editor.isActive('paragraph') ? 'paragraph' : Array.from({length: 6}, (_, i) => i + 1).find((lvl) => editor.isActive('heading', {level: lvl})) ?? ''
                }
                onSelect={(value: string | number) => {
                    if (value === 'paragraph') {
                        editor.chain().focus().setParagraph().run();
                    } else {
                        editor.chain().focus().toggleHeading({level: Number(value) as 1 | 2 | 3 | 4 | 5 | 6}).run();
                    }
                }}
            />
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass(editor.isActive('bulletList'), true)}
            >
                <BsListUl/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={buttonClass(editor.isActive('orderedList'), true)}
            >
                <BsListOl/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={buttonClass(editor.isActive('code'), true)}
            >
                <BsCode/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={buttonClass(editor.isActive('codeBlock'), true)}
            >
                <BsCodeSquare/>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={buttonClass(editor.isActive('blockquote'), true)}
            >
                <BsQuote/>
            </button>


            <button
                onClick={() => editor.chain().focus().insertContent(tableHTML, {
                    parseOptions: {
                        preserveWhitespace: false,
                    },
                }).run()}
                className={buttonClass(false, true)}
            >
                <BsTable/>
            </button>


            <button
                className={buttonClass(false, true) + " border-r-2 border-r-gray-200"}
                onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                <BsHr/>
            </button>

            <button
                className={buttonClass(false, true)}
                onClick={() => editor.chain().focus().undo().run()}>
                <BsArrow90DegLeft/>

            </button>
            <button
                className={buttonClass(false, true)}
                onClick={() => editor.chain().focus().redo().run()}>
                <BsArrow90DegRight/>

            </button>
        </div>
    )
}

export function NoteBrowser({notes, setNoteAction, syncNotesAction}: Readonly<{
    notes: NoteType[],
    setNoteAction: (note: NoteType) => void,
    syncNotesAction: () => Promise<void>
}>) {
    const [loading, setLoading] = useState<boolean>(false);

    return <div className='flex flex-col min-w-32 border border-gray-400'>
        <button
            key={"note_add"}
            className='flex flex-row items-center place-content-center w-full p-1 border-b-2 border-zinc-200 hover:border-zinc-400'
            onClick={() => setNoteAction(getEmptyNote())}
        >
            <BsPlusLg className={"text-lg mr-1"}/> Add
        </button>

        <div className="flex flex-1 flex-col">
            {notes.map((note) =>
                <div
                    className="p-1 flex flex-row justify-between border-b-2 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100"
                    key={"note_" + note.id}
                >
                    <button
                        className='w-full'
                        onClick={() => setNoteAction(note)}
                    >
                        <div className="text-left font-semibold">{note.name}</div>
                        <div className="ps-2">{note.excerpt ?? note.content?.split('</p>')[0]
                            .replace(/<p>/g, '')
                            .substring(0, 10)}...
                        </div>
                    </button>
                    <button className="transition ease-in-out text-zinc-600 hover:text-red-600">
                        <BsTrash />
                    </button>
                </div>
            )}
        </div>
        <button
            key={"note_sync"}
            className='flex flex-row items-center place-content-center w-full p-1 border-t-2 bg-gray-50 border-zinc-200 hover:border-zinc-400'
            onClick={() => {
                if (loading) {
                    return
                }
                setLoading(true)
                syncNotesAction().finally(() => setLoading(false));
            }}
        >
            <BsArrowRepeat className={loading ? "text-lg animate-spin mr-1" : "text-lg mr-1"}/> Sync
        </button>
    </div>;
}

export function NoteEditor({note, saveNoteAction}: Readonly<{
    note: NoteType,
    saveNoteAction: (note: NoteType) => void
}>) {
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
        if (editor && note.content) {
            editor.commands.setContent(note.content);
        }
    }, [editor, note]);

    return <div className='flex flex-col h-full w-full'>
        <NoteMenu editor={editor} saveNoteAction={(html: string, text)=> {
            note.content = html;
            const lineBreak = text.indexOf("\n");
            const nameEnd = lineBreak <= 1 ? 10 : lineBreak;
            note.name = text.substring(0, nameEnd);
            note.excerpt = text.substring(nameEnd + 1, nameEnd + 11)
            saveNoteAction(note)
        }}/>
        <EditorContent editor={editor} className='h-full px-1'/>
    </div>
}

export default function Notes() {
    const [notes, setNotes] = useState<NoteType[]>([]);
    const [note, setNote] = useState<NoteType>(getEmptyNote());

    const store = useRef<IDBStore|null>(null);
    if (!store.current) {
        store.current = new IDBStore({
            tables: ['notes']
        })
    }

    const fireStore = useRef<FirebaseStore|null>(null);
    if (!fireStore.current) {
        fireStore.current = new FirebaseStore({
            tables: ['notes']
        })
    }


    useEffect(() => {
        if(store.current) {
            store.current.load().then(()=> {
                setNotes(store.current?.getAll('notes').toReversed() as NoteType[])
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
        setNotes(store.current.getAll('notes').toReversed() as NoteType[]);

        toast('Note Saved');
    }

    const syncNotesAction = async () => {
        if (!fireStore.current?.ready()) {
            throw new Error('FireStore is not ready');
        }
        if (!store.current) {
            throw new Error('IDBStore is undefined');
        }
        await fireStore.current?.load();
        await DBModel.sync([store.current, fireStore.current], 'notes');
        setNotes(store.current?.getAll('notes').toReversed() as NoteType[]);

        toast('Data synced with Firestore');
    }

    return <div className='flex flex-row h-full w-full'>
        <NoteBrowser notes={notes} setNoteAction={setNote} syncNotesAction={syncNotesAction}></NoteBrowser>
        <NoteEditor note={note} saveNoteAction={saveNoteAction}></NoteEditor>
    </div>
}

