import React, { useEffect, useRef, useState } from 'react';

export interface TerminalProps {
    welcomeMessage?: string;
    username?: string;
}

export default function PTerminal({
    welcomeMessage,
    username,
}: Readonly<TerminalProps>) {
    const [lines, setLines] = useState<string[]>(() =>
        welcomeMessage ? [welcomeMessage] : ['Welcome to Projects Framework']
    );
    const [command, setCommand] = useState<string>('');
    const terminalRef = useRef<HTMLDivElement>(null);

    const userPrompt = (username ?? 'root') + 'projects $';

    const commandHandler = (input: string) => {
        const argsIndex = input.indexOf(' ');
        const baseCommand =
            argsIndex !== -1 ? input.substring(0, argsIndex) : input.trim();

        let response: string | null = null;

        switch (baseCommand) {
            case 'date':
                response = 'Today is ' + new Date().toDateString();
                break;

            case 'random':
                response = Math.floor(Math.random() * 100).toString();
                break;

            case 'clear':
                setLines(
                    welcomeMessage
                        ? [welcomeMessage]
                        : ['Welcome to Projects Framework']
                );
                return;

            default:
                if (input.trim() !== '') {
                    response = 'Unknown command: ' + baseCommand;
                }
                break;
        }

        if (response) {
            setLines((prev) => [...prev, `${userPrompt} ${input}`, response]);
        } else if (input.trim() !== '') {
            setLines((prev) => [...prev, `${userPrompt} ${input}`]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const trimmed = command.trim();
            commandHandler(trimmed);
            setCommand('');
        }
    };

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [lines]);

    return (
        <div
            className='bg-zinc-100 overflow-y-auto h-full w-full p-1 font-mono pe-0'
            ref={terminalRef}
        >
            {lines.map((line, idx) => (
                <div key={idx}>{line}</div>
            ))}
            <div className='flex flex-row w-full'>
                <div className='flex whitespace-nowrap me-1'>{userPrompt} </div>
                <input
                    type='text'
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className='bg-zinc-100 w-full'
                    style={{
                        border: 'none',
                        outline: 'none',
                    }}
                    autoFocus
                />
            </div>
        </div>
    );
}
