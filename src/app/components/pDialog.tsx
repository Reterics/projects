"use client";
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import React, {useEffect, useRef, useState} from 'react';

interface ButtonProps {
    children: string | React.ReactNode;
    onClick: (e?: React.MouseEvent) => void;
}

interface DraggableModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    children: React.ReactNode;
    buttons?: ButtonProps[];
}

let dragging = false;
let initialX = 0;
let initialY = 0;
let initialTop = 0;
let initialLeft = 0;

const PDialog: React.FC<DraggableModalProps> = ({
    open,
    setOpen,
    title,
    children,
    buttons,
}) => {
    const [dialogPosition, setDialogPosition] = useState({ top: 50, left: 50 });
    const dialogRef = useRef(null);

    // Function to handle dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        dragging = true;
        initialX = e.clientX;
        initialY = e.clientY;
        initialTop = dialogPosition.top;
        initialLeft = dialogPosition.left;
    };
    const handleMouseMove = (moveEvent: React.MouseEvent) => {
        if (dragging) {
            const deltaX = moveEvent.clientX - initialX;
            const deltaY = moveEvent.clientY - initialY;
            setDialogPosition({
                top: initialTop + deltaY,
                left: initialLeft + deltaX,
            });
        }
    };

    const handleMouseUp = () => {
        dragging = false;
    };

    return (
        <Dialog
            open={true}
            onClose={(value) => setOpen(value)}
            as='div'
            className='relative z-10'
        >
            <div

            >
                <DialogPanel
                    style={{
                        top: `${dialogPosition.top}px`,
                        left: `${dialogPosition.left}px`,
                        minWidth: '12em',
                    }}
                    className='absolute w-full max-w-md rounded-xl bg-white/5 p-6 data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0'
                >
                    <DialogTitle
                        as='div'
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className='text-base/7 font-medium'
                    >
                        {title}
                    </DialogTitle>
                    <div className='mt-2 text-sm/6'>{children}</div>
                    {buttons && (
                        <div className='mt-4'>
                            {buttons.map(({ ...props }, index) => (
                                <Button key={'modalButton_' + index} {...props} />
                            ))}
                        </div>
                    )}
                </DialogPanel>
            </div>

        </Dialog>
    );
};

export default PDialog;
