import React, {useRef, useState} from 'react';
import { Resizable } from 're-resizable';

export interface DialogProps {
    title?: string
    initialWidth?: number
    initialHeight?: number
    onClose?: ()=>void
    children?: React.ReactNode
}

export default function Dialog({
   title = 'Untitled',
   initialWidth = 400,
   initialHeight = 300,
   onClose,
   children,
}: Readonly<DialogProps>) {
    const [width, setWidth] = useState(initialWidth);
    const [height, setHeight] = useState(initialHeight);
    const dialogRef = useRef<HTMLDivElement>(null);

    const titleBarClasses = `
    flex items-center justify-between
    bg-gradient-to-r from-gray-300 to-gray-100
    border-b border-gray-300
    p-1
    cursor-move
    select-none
  `;

    const windowClasses = `
    border border-gray-400
    shadow-lg
    bg-gray-50
    text-black
    flex flex-col
  `;

    const controlButtonClasses = `
    w-5 h-5 flex items-center justify-center
    border border-gray-400
    hover:bg-gray-200
    cursor-pointer
    ml-1
  `;

    const isMinimized = height < 33 && width < 151;

    return (
        <div ref={dialogRef}>
            <div
                style={{ width: width, height: height }}
                className="absolute top-10 left-10 z-40"
            >
                <Resizable
                    size={{ width: width, height: height }}
                    onResizeStop={(e, direction, ref, d) => {
                        setHeight(height + d.height)
                        setWidth(width + d.width)
                    }}
                >
                    <div className={windowClasses} style={{ width: '100%', height: '100%' }}>
                        <div className={`title-bar ${titleBarClasses}`}>
                            <div className="flex items-center space-x-2 ml-1">
                                <span className="font-bold text-sm">{title}</span>
                            </div>
                            <div className="flex items-center">
                                {!isMinimized && <button className={controlButtonClasses} onClick={() => {
                                    setHeight(32);
                                    setWidth(150);
                                }} title="Minimize">
                                    <div className="w-3 h-3 border border-gray-800 bg-yellow-400"/>
                                </button>}
                                <button className={controlButtonClasses} onClick={() => {
                                    const parent = dialogRef.current?.parentElement;
                                    if (parent) {
                                        setHeight(parent.offsetHeight);
                                        setWidth(parent.offsetWidth);
                                    }
                                }} title="Maximize">
                                    <div className="w-3 h-3 border border-gray-800 bg-green-400"/>
                                </button>
                                <button className={controlButtonClasses} onClick={onClose} title="Close">
                                    <div className="w-3 h-3 border border-gray-800 bg-red-500"/>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto" style={{
                            display: height < 64 ? 'none' : 'flex'
                        }}>
                            {children}
                        </div>
                    </div>
                </Resizable>
            </div>
        </div>
    );
}
