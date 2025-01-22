import { useCallback, useEffect, useRef, useState } from 'react';
import IDBStore from '@/app/database/stores/IDBStore.ts';
import { FirebaseStore } from '@/app/database/stores/FirebaseStore.ts';
import { EncryptedData, isEncrypted } from '@/app/utils/crypto.ts';
import DBModel, {IDBTextEntry} from '@/app/database/DBModel.ts';
import { toast } from 'react-toastify';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import {NoteMenu} from '@/app/pwa/notes';
import {
    BsArrowClockwise,
    BsArrowLeftSquare,
    BsArrowRightSquare,
    BsArrowUpSquare,
    BsFileEarmark,
    BsFileEarmarkPlus,
    BsFolder,
    BsFolderPlus,
    BsPencilSquare,
    BsPlusSquare,
    BsSearch,
    BsSpellcheck,
    BsTrash
} from 'react-icons/bs';
import {ContextMenu, useContextMenu} from "@/app/components/contextMenu";
import ContextMenuEntry from "@/app/components/contextMenu/ContextMenuEntry.tsx";
import {confirmInput,confirm} from "@/app/components/confirm";

export interface ProjectType extends IDBTextEntry {
    notes: string[];
    updated: number;
}

export const getEmptyProject = (): ProjectType => {
    return {
        id: new Date().getTime().toString(),
        content: '',
        name: '',
        notes: [],
        updated: new Date().getTime(),
    };
};

export function ProjectEditor({
    project,
    saveProjectAction,
    backAction,
}: Readonly<{
    project: ProjectType;
    saveProjectAction: (project: ProjectType) => Promise<void>;
    backAction: () => void;
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
        if (editor && project.content) {
            editor.commands.setContent(project.content);
        }
    }, [editor, project]);

    return (
        <div className='flex flex-col h-full w-full'>
            <NoteMenu
                editor={editor}
                saveAction={(html: string) => {
                    project.content = html;
                    return saveProjectAction(project);
                }}
                backAction={backAction}
            />
            <EditorContent editor={editor} className='h-full px-1' />
        </div>
    );
}

export function ProjectBrowser({
    projects,
    setProjectAction,
    saveProjectAction,
}: Readonly<{
    projects: ProjectType[];
    setProjectAction: (project: ProjectType) => void;
    syncProjectsAction: () => Promise<void>;
    saveProjectAction: (project: ProjectType) => Promise<void>;
}>) {
    const nameRef = useRef<HTMLInputElement>(null);
    const { x, y, visible, openContextMenu, closeContextMenu, contextData } =
        useContextMenu();
    const [filter, setFilter] = useState<string>('');
    const ROOT = '/';
    const [path, setPath] = useState<string>(ROOT);
    const [initialGroups, setInitialGroups] = useState<string[]>([]);

    const groupedProjects = projects.reduce<Record<string, ProjectType[]>>(
        (acc, project) => {
            const groupName = project.group?.trim() ? project.group.trim() : ROOT;
            if (!acc[groupName]) {
                acc[groupName] = [];
            }
            acc[groupName].push(project);
            return acc;
        },
        initialGroups.reduce((a,b)=>({...a, [b]: []}), {})
    );
    const groups = [...new Set(Object.keys(groupedProjects)
        .filter((groupName) => groupName.startsWith(path) && groupName !== ROOT)
        .map((groupName)=> groupName.substring(path.length))
        .map((groupName)=> groupName.substring(0, groupName.indexOf('/')))
    )]


    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!setFilter || !e.target) {
            return;
        }
        if (e.key === "Enter") {
            setFilter((e.target as HTMLInputElement).value);
        }
    }, [setFilter]);

    const navBarButton = 'text-2xl p-1 px-1.5 hover:bg-zinc-200 cursor-pointer';
    const navBarInput = 'h-full w-full px-1'
    return (
        <div className='w-full'>
            <div className='flex flex-row items-center font-normal w-full py-1'>
                <div className={navBarButton}><BsArrowLeftSquare/></div>
                <div className={navBarButton}><BsArrowRightSquare/></div>
                <div className={navBarButton}><BsArrowUpSquare/></div>
                <div className={navBarButton}><BsArrowClockwise className='place-self-center'/></div>

                <div className='flex flex-1 text-sm font-semibold truncate me-2 border border-zinc-400 h-7' >
                    <input
                        className={navBarInput}
                        value={path}
                        onChange={(e) => setPath(e.target.value)}/>
                </div>

                <div className='text-sm font-semibold truncate border border-zinc-400 h-7 max-w-20'>
                    <input
                        placeholder='Search...'
                        className={navBarInput}
                        ref={nameRef}
                        onKeyUp={handleKeyPress}/>
                </div>
                <button
                    className='text-lg p-1.5 pe-1 hover:bg-zinc-200 cursor-pointer'
                    onClick={() =>
                        setFilter(nameRef.current?.value ?? '')
                    }
                >
                    <BsSearch/>
                </button>
                <button className={navBarButton} onClick={async () => {
                    const response = await confirmInput([
                        {
                            label: 'Name',
                            name: 'name',
                            value: ''
                        },
                        {
                            label: 'Path',
                            name: 'path',
                            value: '/'
                        }
                    ])
                    if (response instanceof HTMLElement) {
                        const name = (response
                            .querySelector('input[name=name]') as HTMLInputElement)?.value ?? '';
                        const path = (response
                            .querySelector('input[name=path]') as HTMLInputElement)?.value ?? '';

                        setProjectAction({
                            ...getEmptyProject(),
                            name: name,
                            group: path
                        });
                    }

                }
                }><BsPlusSquare/></button>
            </div>
            <div
                className='flex flex-wrap gap-4 p-4'
                onContextMenu={(event) => openContextMenu(event, undefined)}
            >
                {groups.map((group) => (
                    <div
                        className='flex flex-col items-center justify-between p-2 hover:border-zinc-400 hover:bg-zinc-100'
                        key={'group_' + group}
                    >
                        <button
                            className='w-full text-center'
                        >
                            <div className='text-6xl text-zinc-500 mb-2'>
                                <BsFolder />
                            </div>
                            <div className='text-sm font-semibold truncate'>
                                {group}
                            </div>
                        </button>
                    </div>
                ))}
                {projects.filter(p => p.name?.includes(filter)).map((project) => (
                    <div
                        className='flex flex-col items-center justify-between p-2 hover:border-zinc-400 hover:bg-zinc-100'
                        key={'project_' + project.id}
                    >
                        <button
                            className='w-full text-center'
                            onDoubleClick={() => setProjectAction(project)}
                            onContextMenu={(event) => openContextMenu(event, project)}
                        >
                            <div className='text-6xl text-zinc-500 mb-2'>
                                <BsFileEarmark/>
                            </div>
                            <div className='text-sm font-semibold truncate'>
                                {project.name || <span className='text-zinc-400'>(empty)</span>}
                            </div>
                        </button>
                        <div className='text-xs text-zinc-400'>
                            {project.updatedDate}
                        </div>
                    </div>
                ))}
            </div>
            <div
                className='flex flex-1 h-full'
                onContextMenu={(event) => openContextMenu(event, undefined)}
            ></div>
            <ContextMenu x={x} y={y} visible={visible} onClose={closeContextMenu}>
                {!!contextData &&
                    <>
                        <ContextMenuEntry icon={<BsPencilSquare/>} onClick={()=>{
                            const project = contextData as ProjectType
                            setProjectAction(project)
                        }}>
                            Edit
                        </ContextMenuEntry>
                        <ContextMenuEntry icon={<BsSpellcheck />} onClick={async ()=>{
                            const project = contextData as ProjectType

                            const response = await confirmInput([
                                {
                                    label: 'Name',
                                    name: 'name',
                                    value: project.name ?? '',
                                }
                            ])
                            if (response instanceof HTMLElement) {
                                const name = (response
                                    .querySelector('input[name=name]') as HTMLInputElement)?.value ?? '';

                                setProjectAction({
                                    ...project,
                                    name: name
                                });
                            }
                        }}>
                            Rename
                        </ContextMenuEntry>
                        <ContextMenuEntry icon={<BsTrash />} onClick={async () => {
                            const project = contextData as ProjectType
                            const response = await confirm(
                                'Are you sure to delete this project: ' +
                                project.name +
                                ' ?'
                            )
                            if (response) {
                                await saveProjectAction({
                                    ...project,
                                    deleted: true,
                                });
                                setProjectAction(getEmptyProject());
                            }
                        }}>
                            Delete
                        </ContextMenuEntry>
                    </>
                }

                {!contextData &&
                    <>
                        <ContextMenuEntry icon={<BsFileEarmarkPlus />} onClick={async () => {
                            const response = await confirmInput([
                                {
                                    label: 'Name',
                                    name: 'name',
                                    value: ''
                                }
                            ])
                            if (response instanceof HTMLElement) {
                                const name = (response
                                    .querySelector('input[name=name]') as HTMLInputElement)?.value ?? '';

                                setProjectAction({
                                    ...getEmptyProject(),
                                    name: name,
                                    group: path
                                });
                            }
                        }}>
                            New project
                        </ContextMenuEntry>

                        <ContextMenuEntry icon={<BsFolderPlus />} onClick={async ()=> {
                            const response = await confirmInput([
                                {
                                    label: 'Name',
                                    name: 'name',
                                    value: ''
                                }
                            ])
                            if (response instanceof HTMLElement) {
                                const name = (response
                                    .querySelector('input[name=name]') as HTMLInputElement)?.value ?? '';
                                const newPath = `${path + name}/`;

                                if (name && newPath && !initialGroups.includes(newPath)) {
                                    setInitialGroups((prev) => [...prev, newPath])
                                }
                            }
                        }}>
                            New group
                        </ContextMenuEntry>
                    </>
                }

            </ContextMenu>
        </div>
    );
}

export default function Projects() {
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [project, setProject] = useState<ProjectType>(getEmptyProject());

    const store = useRef<IDBStore | null>(null);
    if (!store.current) {
        store.current = new IDBStore({
            tables: ['projects'],
        });
    }

    const fireStore = useRef<FirebaseStore | null>(null);
    if (!fireStore.current) {
        fireStore.current = new FirebaseStore({
            tables: ['projects'],
        });
    }

    const decryptProject = async (project: ProjectType) => {
        if (
            project.name &&
            isEncrypted(project as unknown as EncryptedData)
        ) {
            let error;
            await DBModel.decryptDoc(project).catch((e) => {
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

    const setDecryptedProjects = useCallback(
        async (projects: ProjectType[]) => {
            const decrypted: ProjectType[] = [];
            for (const project of projects) {
                if (await decryptProject(project)) {
                    decrypted.push(project);
                }
            }
            setProjects(decrypted);
        },
        []
    );

    useEffect(() => {
        if (store.current) {
            store.current.load().then(async () => {
                await setDecryptedProjects(
                    store.current
                        ?.getAll('projects')
                        .toReversed() as ProjectType[]
                );
            });
        }
    }, [setDecryptedProjects]);

    const setProjectAction = async (project: ProjectType) => {
        await decryptProject(project);
        setProject(project);
    };

    const saveProjectAction = async (project: ProjectType) => {
        if (!store.current) {
            throw new Error('IDBStore is undefined');
        }

        if (store.current.get(project.id, 'projects')) {
            await store.current.update(project, 'projects');
        } else {
            await store.current.push(project, 'projects');
        }
        await setDecryptedProjects(
            store.current?.getAll('projects').toReversed() as ProjectType[]
        );
        toast('Project Saved');
    };

    const syncProjectsAction = async () => {
        if (!fireStore.current?.ready()) {
            throw new Error('FireStore is not ready');
        }
        if (!store.current) {
            throw new Error('IDBStore is undefined');
        }
        await fireStore.current?.load();
        await DBModel.sync([store.current, fireStore.current], 'projects');
        await setDecryptedProjects(
            store.current?.getAll('projects').toReversed() as ProjectType[]
        );

        toast('Data synced with Firestore');
    };

    const backAction = () => {
        setProject(getEmptyProject());
    };

    return (
        <div className='flex flex-row h-full w-full'>
            {!project.name && (
                <ProjectBrowser
                    projects={projects}
                    setProjectAction={setProjectAction}
                    syncProjectsAction={syncProjectsAction}
                    saveProjectAction={saveProjectAction}
                ></ProjectBrowser>
            )}
            {project.name && (
                <ProjectEditor
                    project={project}
                    saveProjectAction={saveProjectAction}
                    backAction={backAction}
                ></ProjectEditor>
            )}
        </div>
    );
}
