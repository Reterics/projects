import React, { useEffect, useRef, ReactNode, useState } from "react";
import {createPortal} from "react-dom";

interface ContextMenuProps {
    x: number;
    y: number;
    visible: boolean;
    onClose: () => void;
    children: ReactNode; // One or more <ContextMenuEntry> elements
}

export interface ContextMenuState {
    x: number;
    y: number;
    visible: boolean;
}

interface UseContextMenuReturn {
    x: number;
    y: number;
    visible: boolean;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    openContextMenu: (event: MouseEvent<HTMLElement>, data?: unknown) => void;
    closeContextMenu: () => void;
    contextData: unknown;
}

export function ContextMenu (
{
    x,
    y,
    visible,
    onClose,
    children,
}: Readonly<ContextMenuProps>
) {
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        if (visible) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [visible, onClose]);

    if (!visible) return null;

    // PORTAL: Render `menuMarkup` into #portal-root (or document.body)
    const portalRoot = document.getElementById("portal-root") || document.body;
    return createPortal(<div
        ref={menuRef}
        style={{position: "fixed", top: y, left: x, zIndex: 999}}
        className="absolute z-50 bg-white border border-gray-200 rounded shadow text-sm"
    >
        {children}
    </div>, portalRoot);
}

export function useContextMenu(): UseContextMenuReturn {
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        x: 0,
        y: 0,
        visible: false,
    });
    const [contextData, setContextData] = useState<unknown>(null);

    /**
     * Displays the context menu at the mouse event coordinates.
     * @param event  The MouseEvent from onContextMenu or onClick
     * @param data   An optional piece of data representing the item clicked
     */
    const openContextMenu = (event: MouseEvent, data?: unknown) => {
        event.preventDefault();

        const offsetX = 2;
        const offsetY = 2;

        const xPos = event.clientX + offsetX;
        const yPos = event.clientY + offsetY;

        setContextMenu({
            x: xPos,
            y: yPos,
            visible: true,
        });

        if (data !== undefined) {
            setContextData(data);
        }
    };

    const closeContextMenu = () => {
        setContextMenu((prev) => ({ ...prev, visible: false }));
        setContextData(null);
    };

    return {
        x: contextMenu.x,
        y: contextMenu.y,
        visible: contextMenu.visible,
        openContextMenu,
        closeContextMenu,
        contextData,
    };
}
