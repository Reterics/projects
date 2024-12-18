import React, {useCallback, useRef, useState} from 'react';
import { Resizable } from 're-resizable';
import DraggableDiv from "@/app/components/DraggableDiv.tsx";

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
    const posRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const previous = useRef<{
        position: { x: number, y: number },
        width: number,
        height: number
    }>({
        position: posRef.current,
        width: width,
        height: height
    });

    const updatePrevious = useCallback(() => {
        if (previous.current) {
            previous.current = {
                position: posRef.current,
                width: width,
                height: height
            };
        }
    }, [height, width])

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
        <DraggableDiv ref={dialogRef} pos={posRef} handle='.title-bar'>
            <div
                style={{ width: width, height: height }}
                className="absolute z-40"
            >
                <Resizable
                    enable={{
                        bottom: true,
                        bottomRight: true,
                        right: true,
                    }}
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
                                    updatePrevious();
                                    setHeight(32);
                                    setWidth(150);
                                }} title="Minimize">
                                    <div className="w-3 h-3 border border-gray-800 bg-yellow-400"/>
                                </button>}
                                <button className={controlButtonClasses} onClick={() => {
                                    const parent = dialogRef.current?.parentElement;
                                    if (parent) {
                                        if (parent.offsetHeight === height && parent.offsetWidth === width) {
                                            setHeight(previous.current.height);
                                            setWidth(previous.current.width);
                                            if (posRef.current) {
                                                posRef.current.x = previous.current.position.x;
                                                posRef.current.y = previous.current.position.y;
                                            }
                                        } else {
                                            updatePrevious();

                                            setHeight(parent.offsetHeight);
                                            setWidth(parent.offsetWidth);
                                            if (posRef.current) {
                                                posRef.current.x = 0;
                                                posRef.current.y = 0;
                                            }
                                        }

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
        </DraggableDiv>
    );
}
