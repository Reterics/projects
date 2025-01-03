import {useEffect, useRef, useState} from "react";
import IDBStore from "@/app/database/stores/IDBStore.ts";
import {FirebaseStore} from "@/app/database/stores/FirebaseStore.ts";
import {EncryptedData, isEncrypted} from "@/app/utils/crypto.ts";
import DBModel, {IDBData} from "@/app/database/DBModel.ts";
import {toast} from "react-toastify";
import {EditorContent, useEditor} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Table from "@tiptap/extension-table";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import {NoteMenu} from "@/app/pwa/notes";
import {BsFileEarmark, BsFillFloppy2Fill, BsTrash} from "react-icons/bs";

export interface ProjectType extends IDBData {
    id: string;
    title: string;
    description: string;
    notes: string[],
    updated: number;
}

export const getEmptyProject = (): ProjectType => {
    return {
        id: new Date().getTime().toString(),
        description: '',
        title: '',
        notes: [],
        updated: new Date().getTime()
    }
};
export function ProjectEditor({project, saveProjectAction, backAction}: Readonly<{
    project: ProjectType,
    saveProjectAction: (project: ProjectType) => Promise<void>,
    backAction: () => void
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
        if (editor && project.description) {
            editor.commands.setContent(project.description);
        }
    }, [editor, project]);

    return <div className='flex flex-col h-full w-full'>
        <NoteMenu editor={editor} saveAction={(html: string)=> {
            project.description = html;
            return saveProjectAction(project)
        }} backAction={backAction}/>
        <EditorContent editor={editor} className='h-full px-1'/>
    </div>
}

export function ProjectBrowser({projects, setProjectAction, syncProjectsAction, saveProjectAction}: Readonly<{
    projects: ProjectType[],
    setProjectAction: (project: ProjectType) => void,
    syncProjectsAction: () => Promise<void>
    saveProjectAction: (project: ProjectType) => Promise<void>
}>) {
    const nameRef = useRef<HTMLInputElement>(null);
    return (<div>
        <div className="flex flex-wrap gap-4 p-4">

            <div
                className="w-40 h-40 flex flex-col items-center justify-between border border-zinc-200 p-2 hover:border-zinc-400 hover:bg-zinc-100"
            >
                <div
                    className="flex flex-col h-full w-full"
                >
                    <div className="mb-2">
                        Name
                    </div>
                    <div className="text-sm font-semibold truncate flex-1">
                        <input ref={nameRef}/>
                    </div>
                    <button
                        className="text-2xl"
                        onClick={() => setProjectAction({
                            ...getEmptyProject(),
                            title: nameRef.current?.value ?? '',
                        })}
                    >
                        <BsFillFloppy2Fill />
                    </button>
                </div>
            </div>

            {projects.map((project) => (
                <div
                    className="w-40 h-40 flex flex-col items-center justify-between border border-zinc-200 p-2 hover:border-zinc-400 hover:bg-zinc-100"
                    key={"project_" + project.id}
                >
                    <button
                        className="w-full text-center"
                        onClick={() => setProjectAction(project)}
                    >
                        <div className="text-6xl text-zinc-500 mb-2"><BsFileEarmark /></div>
                        <div className="text-sm font-semibold truncate">{project.name}</div>
                    </button>
                    <div className="text-xs text-zinc-400">{project.updatedDate}</div>
                    <button
                        onClick={async () => {
                            if (
                                confirm(
                                    "Are you sure to delete this project: " + project.name + " ?"
                                )
                            ) {
                                await saveProjectAction({
                                    ...project,
                                    deleted: true,
                                });
                                setProjectAction(getEmptyProject());
                            }
                        }}
                        className="transition ease-in-out text-zinc-600 hover:text-red-600 mt-2"
                    >
                        <BsTrash/>
                    </button>
                </div>
            ))}
        </div>
    </div>);
}

export default function Projects() {
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [project, setProject] = useState<ProjectType>(getEmptyProject());

    const store = useRef<IDBStore | null>(null);
    if (!store.current) {
        store.current = new IDBStore({
            tables: ['projects']
        })
    }

    const fireStore = useRef<FirebaseStore | null>(null);
    if (!fireStore.current) {
        fireStore.current = new FirebaseStore({
            tables: ['projects']
        })
    }

    const decryptProject = async (project: ProjectType) => {
        if (!project.title && isEncrypted(project as unknown as EncryptedData)) {
            let error;
            await DBModel.decryptDoc(project)
                .catch(e => {
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

    const setDecryptedProjects = async (projects: ProjectType[]) => {
        const decrypted: ProjectType[] = [];
        for (const project of projects) {
            if (await decryptProject(project)) {
                decrypted.push(project);
            }
        }
        setProjects(decrypted)
    };

    useEffect(() => {
        if (store.current) {
            store.current.load().then(async ()=> {
                await setDecryptedProjects(store.current?.getAll('projects').toReversed() as ProjectType[])
            })
        }
    }, []);


    const setProjectAction = async (project: ProjectType) => {
        await decryptProject(project);
        setProject(project);
        if (store.current) {
            if (store.current.get(project.id, 'projects')) {
                await store.current.update(project, 'projects');
            } else {
                await store.current.push(project, 'projects');
            }
        }
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
        await setDecryptedProjects(store.current?.getAll('projects').toReversed() as ProjectType[]);

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
        await setDecryptedProjects(store.current?.getAll('projects').toReversed() as ProjectType[]);

        toast('Data synced with Firestore');
    };

    const backAction = () => {
        setProject(getEmptyProject())
    };

    return <div className='flex flex-row h-full w-full'>
        {!project.title && <ProjectBrowser projects={projects} setProjectAction={setProjectAction} syncProjectsAction={syncProjectsAction} saveProjectAction={saveProjectAction}></ProjectBrowser>}
        {project.title && <ProjectEditor project={project} saveProjectAction={saveProjectAction} backAction={backAction}></ProjectEditor> }
    </div>
}
