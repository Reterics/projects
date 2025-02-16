'use client';
import {useEditor, EditorContent} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import {Editor} from '@tiptap/core';
import './style.scss';
import IDBStore from '@/app/database/stores/IDBStore.ts';
import {useCallback, useEffect, useRef, useState} from 'react';
import DBModel, {IDBTextEntry} from '@/app/database/DBModel.ts';
import {toast} from 'react-toastify';
import {FirebaseStore} from '@/app/database/stores/FirebaseStore.ts';
import {
  BsArrow90DegLeft,
  BsArrow90DegRight,
  BsArrowRepeat,
  BsCaretLeft,
  BsCaretRight,
  BsChevronDoubleLeft,
  BsChevronDoubleRight,
  BsChevronDown,
  BsChevronRight,
  BsCode,
  BsCodeSquare,
  BsFloppy,
  BsFolderPlus,
  BsHr,
  BsListOl,
  BsListUl,
  BsPlusLg,
  BsQuote,
  BsTable,
  BsTrash,
  BsType,
  BsTypeBold,
  BsTypeH1,
  BsTypeH2,
  BsTypeH3,
  BsTypeH4,
  BsTypeH5,
  BsTypeH6,
  BsTypeItalic,
  BsTypeStrikethrough,
} from 'react-icons/bs';
import Dropdown from '@/app/components/Dropdown.tsx';
import {EncryptedData, isEncrypted} from '@/app/utils/crypto.ts';
import {confirm} from '@/app/components/confirm';
import {deleteNote, fetchNotes, updateNote} from '@/slices/notesSlice.ts';
import {useNotes} from '@/hooks/useNotes.ts';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '@/store.ts';

export interface NoteType extends IDBTextEntry {
  timeLabel?: string;
}

export interface NoteMenuProps {
  editor: Editor | null;
  saveAction: (html: string, text: string) => void;
  backAction?: () => void;
  removeAction?: () => void;
  leftSideAction?: () => void;
}

export const getEmptyNote = (): NoteType => {
  return {
    id: new Date().getTime().toString(),
    content: '<p><strong>Title</strong></p><p></p>',
    name: '',
    updated: new Date().getTime(),
  };
};

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
`;

export function NoteMenu({
  editor,
  saveAction,
  backAction,
  removeAction,
  leftSideAction,
}: Readonly<NoteMenuProps>) {
  const [extended, setExtended] = useState(false);

  if (!editor) return null;

  const buttonClass = (isActive?: boolean, icon?: boolean) => {
    const textSize = !icon ? '  text-lg' : '';
    if (!isActive) {
      return 'p-2 cursor-pointer hover:bg-gray-200' + textSize;
    } else {
      return (
        'p-2 cursor-pointer text-lg font-bold bg-gray-200 border rounded-md' +
        textSize
      );
    }
  };

  const paragraphOptions = [
    {value: 'paragraph', icon: <BsType />, label: 'Paragraph'},
    {value: '1', icon: <BsTypeH1 />, label: 'Heading 1'},
    {value: '2', icon: <BsTypeH2 />, label: 'Heading 2'},
    {value: '3', icon: <BsTypeH3 />, label: 'Heading 3'},
    {value: '4', icon: <BsTypeH4 />, label: 'Heading 4'},
    {value: '5', icon: <BsTypeH5 />, label: 'Heading 5'},
    {value: '6', icon: <BsTypeH6 />, label: 'Heading 6'},
  ];

  return (
    <div className='w-full flex flex-row'>
      <div className='flex flex-row h-fit'>
        {backAction && (
          <button
            className={
              buttonClass(false, true) + ' border-r-2 border-r-gray-200'
            }
            onClick={() => backAction()}
          >
            <BsCaretLeft />
          </button>
        )}
        {leftSideAction && (
          <button
            className={
              buttonClass(false, true) + ' border-r-2 border-r-gray-200'
            }
            onClick={() => leftSideAction()}
          >
            <BsCaretRight />
          </button>
        )}

        <button
          className={buttonClass(false, true) + ' border-r-2 border-r-gray-200'}
          onClick={() => saveAction(editor?.getHTML(), editor?.getText())}
        >
          <BsFloppy />
        </button>
      </div>

      <div className='w-full flex flex-row flex-wrap border-b-2 border-zinc-200 place-content-center'>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive('bold'))}
        >
          <BsTypeBold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive('italic'))}
        >
          <BsTypeItalic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={buttonClass(editor.isActive('strike'))}
        >
          <BsTypeStrikethrough />
        </button>

        {extended && (
          <>
            <Dropdown
              className={
                buttonClass(false, true) + ' border-r-2 border-r-gray-200'
              }
              options={paragraphOptions}
              value={
                editor.isActive('paragraph')
                  ? 'paragraph'
                  : (Array.from({length: 6}, (_, i) => i + 1).find((lvl) =>
                      editor.isActive('heading', {
                        level: lvl,
                      })
                    ) ?? '')
              }
              onSelect={(value: string | number) => {
                if (value === 'paragraph') {
                  editor.chain().focus().setParagraph().run();
                } else {
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({
                      level: Number(value) as 1 | 2 | 3 | 4 | 5 | 6,
                    })
                    .run();
                }
              }}
            />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={buttonClass(editor.isActive('bulletList'), true)}
            >
              <BsListUl />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={buttonClass(editor.isActive('orderedList'), true)}
            >
              <BsListOl />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={buttonClass(editor.isActive('code'), true)}
            >
              <BsCode />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={buttonClass(editor.isActive('codeBlock'), true)}
            >
              <BsCodeSquare />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={buttonClass(editor.isActive('blockquote'), true)}
            >
              <BsQuote />
            </button>

            <button
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertContent(tableHTML, {
                    parseOptions: {
                      preserveWhitespace: false,
                    },
                  })
                  .run()
              }
              className={buttonClass(false, true)}
            >
              <BsTable />
            </button>

            <button
              className={
                buttonClass(false, true) + ' border-r-2 border-r-gray-200'
              }
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <BsHr />
            </button>

            <button
              className={buttonClass(false, true)}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <BsArrow90DegLeft />
            </button>
            <button
              className={buttonClass(false, true)}
              onClick={() => editor.chain().focus().redo().run()}
            >
              <BsArrow90DegRight />
            </button>
          </>
        )}

        <button
          className={buttonClass(false, true) + ' border-s-2 border-r-gray-200'}
          onClick={() => setExtended(!extended)}
        >
          {extended && <BsChevronDoubleLeft />}
          {!extended && <BsChevronDoubleRight />}
        </button>
      </div>
      <div className='flex flex-row h-fit'>
        {removeAction && (
          <button
            className={
              buttonClass(false, true) + ' border-s-2 border-r-gray-200'
            }
            onClick={() => removeAction()}
          >
            <BsTrash />
          </button>
        )}
      </div>
    </div>
  );
}

export function NoteBrowser({
  notes,
  setNoteAction,
  syncNotesAction,
  saveNoteAction,
  controlSidebar,
}: Readonly<{
  notes: NoteType[];
  setNoteAction: (note: NoteType) => void;
  syncNotesAction: () => Promise<void>;
  saveNoteAction: (note: NoteType) => Promise<void>;
  controlSidebar?: (sideBarOpen: boolean) => void;
}>) {
  const [loading, setLoading] = useState<boolean>(false);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [emptyGroups, setEmptyGroups] = useState<string[]>([]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const groupedNotes = notes.reduce<Record<string, NoteType[]>>((acc, note) => {
    // Optional: default to "No Group" if the note.group is blank or not defined
    const groupName = note.group?.trim() ? note.group.trim() : '(none)';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(note);
    return acc;
  }, {});
  if (emptyGroups.length) {
    emptyGroups.forEach((group) => (groupedNotes[group] = []));
  }

  const addFolder = async () => {
    const folderInput = (
      <div className='flex flex-row w-full justify-between'>
        <label htmlFor='folder' className='w-1/3 content-center'>
          Folder:{' '}
        </label>
        <input
          type='text'
          name='folder'
          id='folder'
          className='folder h-8 w-2/3 border border-zinc-200 p-1'
        />
      </div>
    );
    const response = await confirm(folderInput, {
      confirmMessage: 'Add',
      cancelMessage: 'Cancel',
    });

    if (response instanceof HTMLElement) {
      const folderName = (
        response.querySelector('input.folder') as HTMLInputElement
      )?.value;
      if (folderName && !emptyGroups.includes(folderName)) {
        setEmptyGroups([...emptyGroups, folderName]);
      }
    }
  };

  const getExcerpt = useCallback((string?: string) => {
    const lines =
      string
        ?.split('</p>')
        .slice(0, 3)
        .map((line) => line.replace(/<[^>]*>/g, '').trim())
        .filter((line) => line) ?? [];

    return (lines[lines.length - 1] || lines[0] || '').substring(0, 15);
  }, []);
  return (
    <div className='flex flex-col overflow-y-auto min-w-64 border-e-2 border-zinc-200'>
      <div className='flex flex-row'>
        <button
          key={'note_sync'}
          className='flex flex-row items-center place-content-center w-full p-2 border-b-2 border-e bg-gray-50 border-zinc-200 hover:bg-gray-200'
          onClick={() => {
            if (loading) {
              return;
            }
            setLoading(true);
            syncNotesAction().finally(() => setLoading(false));
          }}
        >
          <BsArrowRepeat
            className={loading ? 'text-lg animate-spin mr-1' : 'text-lg mr-1'}
          />
        </button>

        <button
          key={'note_add'}
          className='flex flex-row items-center place-content-center w-full p-2 border-b-2 border-s border-zinc-200 hover:bg-gray-200'
          onClick={() => addFolder()}
        >
          <BsFolderPlus className={'text-lg mr-1'} />
        </button>
      </div>

      <div className='flex flex-1 flex-col'>
        {
          <>
            {Object.keys(groupedNotes).map((group) => {
              const groupNoteList = groupedNotes[group] ?? [];
              const isCollapsed = !expandedGroups[group];

              return (
                <div key={group}>
                  <button
                    className='w-full flex flex-row items-center bg-gray-100 hover:bg-gray-200 px-2 py-1 font-semibold'
                    onClick={() => toggleGroup(group)}
                  >
                    {isCollapsed ? (
                      <BsChevronRight className='mr-2' />
                    ) : (
                      <BsChevronDown className='mr-2' />
                    )}
                    <span>{group}</span>
                    <span className='ml-auto text-sm text-gray-500'>
                      ({groupNoteList.length})
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className='border-s'>
                      {groupNoteList.map((note) => (
                        <div
                          className='p-1 ps-4 flex flex-row justify-between border-b-2 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100'
                          key={'note_' + note.id}
                        >
                          <button
                            className='w-full text-left'
                            onClick={() => setNoteAction(note)}
                          >
                            <div className='font-semibold'>{note.name}</div>
                            <div className='ps-2'>
                              <span className='font-medium text-sm me-1'>
                                {note.timeLabel}
                              </span>
                              {getExcerpt(note.content)}
                              ...
                            </div>
                          </button>
                          <button
                            onClick={async () => {
                              const response = await confirm(
                                'Are you sure to delete this note: ' +
                                  note.name +
                                  '?'
                              );
                              if (response) {
                                await saveNoteAction({
                                  ...note,
                                  deleted: true,
                                });
                                setNoteAction(getEmptyNote());
                              }
                            }}
                            className='transition ease-in-out text-zinc-600 hover:text-red-600'
                          >
                            <BsTrash />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          setNoteAction({
                            ...getEmptyNote(),
                            group,
                          });
                          if (controlSidebar) {
                            controlSidebar(false);
                          }
                        }}
                        className='w-full p-1 flex hover:bg-zinc-100 place-content-center place-items-center cursor-pointer border-b-2 border-zinc-200 hover:border-zinc-400'
                      >
                        <BsPlusLg className={'text-lg mr-1'} /> Add
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        }
      </div>
    </div>
  );
}

export function NoteEditor({
  note,
  saveAction,
  removeAction,
  leftSideAction,
  backAction,
}: Readonly<{
  note: NoteType;
  saveAction: (note: NoteType) => void;
  removeAction: () => void;
  leftSideAction?: () => void;
  backAction?: () => void;
}>) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableHeader,
      TableRow,
      TableCell,
    ],
    // content: note.content,
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
  });

  useEffect(() => {
    if (editor && note.content) {
      editor.commands.setContent(note.content);
    }
  }, [editor, note]);

  return (
    <div className='flex flex-col h-full w-full'>
      <NoteMenu
        editor={editor}
        saveAction={(html: string, text) => {
          const lineBreak = text.indexOf('\n');
          const nameEnd = lineBreak <= 1 ? 10 : lineBreak;
          saveAction({
            ...note,
            content: html,
            name: text.substring(0, nameEnd),
          });
        }}
        removeAction={removeAction}
        leftSideAction={leftSideAction}
        backAction={backAction}
      />
      <EditorContent editor={editor} className='h-full px-1 overflow-auto' />
    </div>
  );
}

export default function Notes() {
  const {notes} = useNotes();
  const dispatch = useDispatch<AppDispatch>();

  const [note, setNote] = useState<NoteType>(getEmptyNote());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fireStore = useRef<FirebaseStore | null>(null);
  if (!fireStore.current) {
    fireStore.current = new FirebaseStore({
      tables: ['notes'],
    });
  }

  const decryptNote = async (note: NoteType) => {
    if (!note.content && isEncrypted(note as unknown as EncryptedData)) {
      let error;
      await DBModel.decryptDoc(note).catch((e) => {
        // console.error(e);
        error = e;
      });
      if (error) {
        // toast.error('Error decrypting note');
        return false;
      }
    }
    return true;
  };

  const setNoteAction = async (note: NoteType) => {
    await decryptNote(note);
    setNote(note);
  };

  const saveNoteAction = async (note: NoteType) => {
    dispatch(updateNote(note));

    toast('Note Saved Locally');
  };

  const syncNotesAction = async () => {
    if (!fireStore.current?.ready()) {
      throw new Error('FireStore is not ready');
    }
    await fireStore.current?.load();
    // Legacy support TODO: Find alternative
    await DBModel.sync(
      [
        new IDBStore({
          tables: ['notes'],
        }),
        fireStore.current,
      ],
      'notes'
    );
    dispatch(fetchNotes());

    toast('Data synced with Firestore');
  };

  const removeNoteAction = async () => {
    if (note?.id) {
      const response = await confirm(
        'IMPORTANT: Are you sure to completely delete this note: ' +
          note.name +
          '?'
      );
      if (response) {
        deleteNote(note.id);
        await fireStore.current?.remove(note.id, 'notes');
        toast('Note Removed');
        setNote(getEmptyNote());
      }
    }
  };

  return (
    <div className='flex flex-row h-full w-full overflow-hidden'>
      {sidebarOpen && (
        <NoteBrowser
          notes={notes}
          setNoteAction={setNoteAction}
          syncNotesAction={syncNotesAction}
          saveNoteAction={saveNoteAction}
          controlSidebar={setSidebarOpen}
        />
      )}
      <NoteEditor
        note={note}
        saveAction={saveNoteAction}
        removeAction={removeNoteAction}
        backAction={sidebarOpen ? () => setSidebarOpen(false) : undefined}
        leftSideAction={!sidebarOpen ? () => setSidebarOpen(true) : undefined}
      />
    </div>
  );
}
