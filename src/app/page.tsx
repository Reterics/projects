'use client';
import React, {useState} from 'react';
import Dialog from './components/Dialog';
import { ToastContainer } from 'react-toastify';
import './page.css';
import PTerminal from "@/app/pwa/pTerminal";
import Notes from "@/app/pwa/notes/index";
import MenuBar, {MenuBarItem} from "@/app/components/MenuBar.tsx";

export interface RunningApp {
    id: string;
    label: string;
    className?: string;
    icon: React.ReactNode;
    command?: () => void;
    focus?: () => void;
    show: boolean;
    onClose?: () => void;
    entry: React.ReactNode;
}


export default function Home() {
    const [apps, setApps] = useState<RunningApp[]>([]);

    const focusAppById = (id: string)=> {
        let dialogNode: HTMLElement|null = null;
        let maxZIndex = 1;
        for (const node of document.querySelectorAll('.running-app-dialog')) {
            if (node.id === 'app_' + id) {
                dialogNode = node.parentElement as HTMLElement;
            }

            const unitValue = node.parentElement?.computedStyleMap().get('z-index') as CSSUnitValue;

            const zIndex = unitValue.unit === 'number' ? Number(unitValue.value) : 0;
            if (zIndex && !Number.isNaN(zIndex) && maxZIndex < zIndex) {
                if (node.id === 'app_' + id) {
                    dialogNode = node.parentElement as HTMLElement;
                } else {
                    maxZIndex = zIndex;
                }
            } else if (node.id === 'app_' + id) {
                dialogNode = node.parentElement as HTMLElement;
            }
        }
        maxZIndex++;
        if (dialogNode) {
            dialogNode.style.zIndex = maxZIndex.toString();
            dialogNode.style.display = 'flex';
        }
    };

    const hideAppById = (id: string)=> {
        const dialogNode = document.getElementById('app_' + id);
        if (dialogNode?.parentElement) {
            dialogNode.parentElement.style.display = 'none';
        }
    };

    const getDockIcon = (icon: string, id: string) => {

        return (
            <div className="bg-white p-4 flex items-center justify-center">
                <button onClick={(event)=>{
                    event.preventDefault();
                    setApps(prevApps => [...prevApps.filter(app => app.id!== id)])
                }}><i className="absolute top-0 right-0 pi pi-times p-0.5 bg-gray-50"></i></button>

                <i className={"pi " + icon + " text-xl"}/>
            </div>
        )
    };

    const menubarItems: MenuBarItem[] = [
        {
            label: 'Home',
            className: 'menubar-root'
        },
        {
            label: 'Apps',
            items: [
                {
                    label: 'Terminal',
                    icon: 'pi pi-fw pi-code',

                    command() {
                        const id = new Date().getTime().toString()
                        setApps((prevApps) => {
                            return [...prevApps, {
                                id,
                                label: 'Terminal',
                                icon: getDockIcon('pi-fw pi-code', id),
                                show: true,
                                focus: () => focusAppById(id),
                                command: () => focusAppById(id),
                                onClose: () => hideAppById(id),
                                entry: <PTerminal />,
                            }];
                        })
                    }
                },
                {
                    label: 'Notes',
                    icon: 'pi pi-book',

                    command() {
                        const id = new Date().getTime().toString()
                        setApps((prevApps) => {
                            return [...prevApps, {
                                id,
                                label: 'Notes',
                                icon: getDockIcon('pi pi-book', id),
                                show: true,
                                focus: () => focusAppById(id),
                                command: () => focusAppById(id),
                                onClose: () => hideAppById(id),
                                entry: <Notes />,
                            }];
                        })
                    }
                },
                {
                    separator: true
                }
            ]
        }
    ];

    return (
        <div className="system-outer w-dvw h-dvh flex flex-col">
            <MenuBar model={menubarItems}/>
            <div className="dock-window dock-advanced flex flex-1">
                <ToastContainer />

                {apps
                    .map((app, index)=>
                        <Dialog key={'app_' + app.id + '_' + index}
                                initialWidth={window.innerWidth / 2}
                                initialHeight={window.innerHeight * 0.4}
                                onClose={() => setApps((prevApps) => prevApps.filter(a => a !== app))}
                                >
                            {app.entry}
                        </Dialog>
                )}

            </div>
        </div>
    );
}
