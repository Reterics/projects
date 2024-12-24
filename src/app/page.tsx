'use client';
import React, {useEffect, useState} from 'react';
import Dialog from './components/Dialog';
import { ToastContainer } from 'react-toastify';
import './page.css';
import MenuBar, {MenuBarItem} from "@/app/components/MenuBar.tsx";
import {pwaItems} from "@/app/pwa";
import { useSearchParams } from "next/navigation";
import PasswordDialog from "@/app/pwa/Password.tsx";

export interface RunningApp {
    id: string;
    label: string;
    className?: string;
    icon?: React.ReactNode;
    focus?: () => void;
    show: boolean;
    onClose?: () => void;
    entry: React.ReactNode;
    width?: number;
    height?: number;
}


export default function Home() {
    const [apps, setApps] = useState<RunningApp[]>([
        {
            id: '0_pwd',
            label: 'Password Entry',
            show: true,
            entry: <PasswordDialog closeAction={() =>
                setApps((prevApps) => prevApps.filter(a => a.id !== '0_pwd'))}/>,
            width: 200,
            height: 100,
        }
    ]);

    const searchParams = useSearchParams();
    const appName = searchParams?.get('app');

    const onCreateAction = (runningApp: RunningApp) => {
        setApps(prevApps => {
            return [...prevApps, runningApp];
        })
    };

    useEffect(() => {
        if (appName && !apps.length) {
            const app = pwaItems.find(item => item.name === searchParams?.get('app'));
            if (app?.create) {
                const createdApp = app.create()
                createdApp.width = window.innerWidth;
                createdApp.height = window.innerHeight;
                onCreateAction(createdApp)
            }
        }
    }, [appName, apps, searchParams])

    const menubarItems: MenuBarItem[] = [
        {
            label: 'Home',
            className: 'menubar-root'
        },
        {
            label: 'Apps',
            items: pwaItems
        }
    ];

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="system-outer w-full h-full flex flex-col">
            {!appName &&<MenuBar model={menubarItems} onCreate={onCreateAction}/> }
            <div className="dock-window flex flex-1">
                <ToastContainer />

                {apps
                    .map((app, index)=>
                        <Dialog key={'app_' + app.id + '_' + index}
                                title={app.label}
                                initialX={(window.innerWidth / 2) - (app.width ?? window.innerWidth / 2) / 2}
                                initialY={(window.innerHeight / 2) - (app.height ?? window.innerHeight * 0.4) / 2}
                                initialWidth={app.width ?? window.innerWidth / 2}
                                initialHeight={app.height ?? window.innerHeight * 0.4}
                                onClose={() => setApps((prevApps) => prevApps.filter(a => a !== app))}
                                >
                            {app.entry}
                        </Dialog>
                )}

            </div>
        </div>
    );
}
