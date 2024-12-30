import {useEffect, useRef, useState} from "react";
import IDBStore from "@/app/database/stores/IDBStore.ts";
import {FirebaseStore} from "@/app/database/stores/FirebaseStore.ts";
import {EncryptedData, isEncrypted} from "@/app/utils/crypto.ts";
import DBModel, {IDBData} from "@/app/database/DBModel.ts";
import {toast} from "react-toastify";

export interface ProjectType extends IDBData{
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
export function ProjectEditor({project, saveProjectAction}: Readonly<{
    project: ProjectType,
    saveProjectAction: (project: ProjectType) => Promise<void>
}>) {
    return <div></div>;
}

export function ProjectBrowser({projects, setProjectAction, syncProjectsAction, saveProjectAction}: Readonly<{
    projects: ProjectType[],
    setProjectAction: (project: ProjectType) => void,
    syncProjectsAction: () => Promise<void>
    saveProjectAction: (project: ProjectType) => Promise<void>
}>) {
    return (<div>
        {projects.map((project, index) => <div key={'project_'+index}>{project.title}</div>)}
    </div>);
}

export default function Projects() {
    const [projects, setProjects] = useState<ProjectType[]>([]);
    const [project, setProject] = useState<ProjectType>(getEmptyProject());

    const store = useRef<IDBStore|null>(null);
    if (!store.current) {
        store.current = new IDBStore({
            tables: ['projects']
        })
    }

    const fireStore = useRef<FirebaseStore|null>(null);
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
        if(store.current) {
            store.current.load().then(async ()=> {
                await setDecryptedProjects(store.current?.getAll('projects').toReversed() as ProjectType[])
            })
        }
    }, []);


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

    return <div className='flex flex-row h-full w-full'>
        <ProjectBrowser projects={projects} setProjectAction={setProjectAction} syncProjectsAction={syncProjectsAction} saveProjectAction={saveProjectAction}></ProjectBrowser>
        <ProjectEditor project={project} saveProjectAction={saveProjectAction}></ProjectEditor>
    </div>
}
