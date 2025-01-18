import React, { ReactNode, MouseEventHandler } from "react";

interface ContextMenuEntryProps {
    onClick: MouseEventHandler<HTMLButtonElement>;
    icon?: ReactNode;
    children: ReactNode;
}

export function ContextMenuEntry (
{
    onClick,
    icon,
    children,
}: Readonly<ContextMenuEntryProps>) {
    return (
        <button
            onClick={onClick}
            className="flex items-center w-full text-left px-3 py-1 hover:bg-gray-100"
        >
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    );
};

export default ContextMenuEntry;
