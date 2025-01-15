import { BsBook, BsBoxes, BsFillTerminalFill } from 'react-icons/bs';
import PTerminal from '@/app/pwa/pTerminal.tsx';
import React from 'react';
import Notes from '@/app/pwa/notes';
import Projects from '@/app/pwa/projects';
import { MenuBarItem } from '@/app/components/MenuBar.tsx';
import { RunningApp } from '@/app/page.tsx';

export const focusAppById = (id: string) => {
    let dialogNode: HTMLElement | null = null;
    let maxZIndex = 1;
    for (const node of document.querySelectorAll('.running-app-dialog')) {
        if (node.id === 'app_' + id) {
            dialogNode = node.parentElement as HTMLElement;
        }

        const unitValue = node.parentElement
            ?.computedStyleMap()
            .get('z-index') as CSSUnitValue;

        const zIndex =
            unitValue.unit === 'number' ? Number(unitValue.value) : 0;
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

export const hideAppById = (id: string) => {
    const dialogNode = document.getElementById('app_' + id);
    if (dialogNode?.parentElement) {
        dialogNode.parentElement.style.display = 'none';
    }
};

const notes: MenuBarItem = {
    name: 'notes',
    label: 'Notes',
    icon: <BsBook />,
    create: (): RunningApp => {
        const id = new Date().getTime().toString();
        return {
            id,
            label: notes.label,
            icon: notes.icon,
            show: true,
            focus: () => focusAppById(id),
            onClose: () => hideAppById(id),
            entry: <Notes />,
        };
    },
};

const terminal: MenuBarItem = {
    name: 'terminal',
    label: 'Terminal',
    icon: <BsFillTerminalFill />,
    create: () => {
        const id = new Date().getTime().toString();
        return {
            id,
            label: notes.label,
            icon: notes.icon,
            show: true,
            focus: () => focusAppById(id),
            onClose: () => hideAppById(id),
            entry: <PTerminal />,
        };
    },
};

const projects: MenuBarItem = {
    name: 'projects',
    label: 'Projects',
    icon: <BsBoxes />,
    create: () => {
        const id = new Date().getTime().toString();
        return {
            id,
            label: projects.label,
            icon: projects.icon,
            show: true,
            focus: () => focusAppById(id),
            onClose: () => hideAppById(id),
            entry: <Projects />,
        };
    },
};

export const pwaItems: MenuBarItem[] = [notes, terminal, projects];
