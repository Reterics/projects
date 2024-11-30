'use client';
import React, {useEffect, useRef, useState} from 'react';
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from 'primereact/dialog';
import { Terminal } from 'primereact/terminal';
import { Toast } from 'primereact/toast';
import { Menubar } from 'primereact/menubar';
import {MenuItem} from 'primereact/menuitem';
import Image from 'next/image'
import logoDark from './assets/logo_thick.png';
import './page.css';
import {getCurrentTime} from "@/app/utils/common";
import {TerminalService} from "primereact/terminalservice";
import {Dock} from "primereact/dock";


export interface RunningApp {
    id: string;
    label: string;
    className?: string;
    icon: React.ReactNode;
    commandHandler?: ()=>void;
    show: boolean;
    onClose?: () => void;
}



export default function Home() {
    const [apps, setApps] = useState<RunningApp[]>([]);
    const toast = useRef<Toast>(null);
    const toast2 = useRef<Toast>(null);

    const menubarItems :MenuItem[] = [
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
                        setApps([...apps, {
                            id,
                            label: 'Terminal',
                            icon: <div className="bg-white p-4 flex items-center justify-center"><i className="pi pi-fw pi-code text-xl"/></div>,
                            commandHandler: ()=> {
                                console.log('Called')
                            },
                            show: true,
                            onClose: ()=> {
                                setApps([...apps.map(app => {
                                    if (app.id === id) {
                                        app.show = false;
                                    }
                                    return app;
                                })])
                            }
                        }])
                    }
                },
                {
                    separator: true
                },
                {
                    label: 'Install',
                    icon: 'pi pi-fw pi-plus'
                }
            ]
        }
    ];

    const start = <Image src={logoDark} alt={'Logo'} width={18} height={18}/>;
    const end = (
        <React.Fragment>
            <i className="pi pi-search"/>
            <span>{getCurrentTime()}</span>
        </React.Fragment>
    );

    const commandHandler = (text: string) => {
        let response;
        const argsIndex = text.indexOf(' ');
        const command = argsIndex !== -1 ? text.substring(0, argsIndex) : text;

        switch (command) {
            case 'date':
                response = 'Today is ' + new Date().toDateString();
                break;

            case 'random':
                response = Math.floor(Math.random() * 100);
                break;

            case 'clear':
                response = null;
                break;

            default:
                response = 'Unknown command: ' + command;
                break;
        }

        if (response)
            TerminalService.emit('response', response);
        else
            TerminalService.emit('clear');
    };

    useEffect(() => {
        TerminalService.on('command', commandHandler);

        return () => {
            TerminalService.off('command', commandHandler);
        };
    }, []);

    return (
        <div className="system-outer w-dvw h-dvh flex flex-col">
            <Tooltip className="dark-tooltip" target=".dock-advanced .p-dock-action" my="center+15 bottom-15"
                     at="center top" showDelay={150}/>
            <Menubar model={menubarItems} start={start} end={end}/>
            <div className="dock-window dock-advanced flex flex-1">
                <Toast ref={toast}/>
                <Toast ref={toast2} position="top-center"/>
                <Dock model={apps}></Dock>
                {apps
                    .map((app, index)=>
                        app.label === 'Terminal' &&
                        <Dialog key={'app_' + index}
                                header={<span className="text-lg">Terminal</span>}
                                className="terminal-dialog"
                                visible={app.show} breakpoints={{'960px': '50vw', '600px': '75vw'}}
                                resizable={true}
                                modal={false}
                                style={{width: '30vw'}} onHide={() => app.onClose && app.onClose()}
                                maximizable
                                blockScroll={false}>
                            <Terminal welcomeMessage="Welcome to Projects Framework"
                                      prompt="projects $"/>
                        </Dialog>
                )}

            </div>
        </div>
    );
}
