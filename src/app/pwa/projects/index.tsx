import {useState} from "react";
import {NoteType} from "@/app/pwa/notes";

export interface ProjectType {
    id: string;
    title: string;
    description: string;
    notes: NoteType[],
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

    const saveProjectAction = async (project: ProjectType) => {
        //TODO: Implement
    };

    const syncProjectsAction = async () => {
        //TODO: Implement
    };

    return <div className='flex flex-row h-full w-full'>
        <ProjectBrowser projects={projects} setProjectAction={setProject} syncProjectsAction={syncProjectsAction} saveProjectAction={saveProjectAction}></ProjectBrowser>
        <ProjectEditor project={project} saveProjectAction={saveProjectAction}></ProjectEditor>
    </div>
}
