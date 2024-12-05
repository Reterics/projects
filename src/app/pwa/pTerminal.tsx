import {TerminalService} from "primereact/terminalservice";
import React, {useEffect} from "react";
import { Terminal } from 'primereact/terminal';

export interface TerminalProps {
    welcomeMessage?: string;
    username?: string;
}

export default function PTerminal ({welcomeMessage, username}: Readonly<TerminalProps>) {
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
        <Terminal welcomeMessage={welcomeMessage ?? "Welcome to Projects Framework"}
                  prompt={(username ?? 'root') + "projects $"}/>
    )
}
