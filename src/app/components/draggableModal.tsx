import React, { useRef, useState } from 'react';
import {
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogBody,
    Button,
    DialogRoot,
    DialogTitle,
    IconButton,
} from '@chakra-ui/react';
import styles from './draggableModal.module.css';
import { FaXmark } from 'react-icons/fa6';

interface ButtonProps {
    children: string | React.ReactNode;
    onClick: (e?: React.MouseEvent) => void;
    colorPalette?:
        | 'transparent'
        | 'current'
        | 'black'
        | 'white'
        | 'whiteAlpha'
        | 'blackAlpha'
        | 'gray'
        | 'red'
        | 'orange'
        | 'yellow'
        | 'green'
        | 'teal'
        | 'blue'
        | 'cyan'
        | 'purple'
        | 'pink'
        | 'bg'
        | 'fg'
        | 'border';
    variant?: 'solid' | 'subtle' | 'surface' | 'outline' | 'ghost' | 'plain';
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

const DraggableModal: React.FC<DraggableModalProps> = ({
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
        <DialogRoot
            lazyMount
            open={open}
            onOpenChange={(e) => setOpen(e.open)}
            size={'xs'}
        >
            <div
                ref={dialogRef}
                style={{
                    position: 'absolute',
                    top: `${dialogPosition.top}px`,
                    left: `${dialogPosition.left}px`,
                    minWidth: '12em',
                }}
            >
                <DialogContent className={styles.content}>
                    <DialogHeader
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className={styles.header}
                        cursor='move'
                    >
                        <DialogTitle className={styles.title}>
                            {title}
                        </DialogTitle>
                        <IconButton
                            size={'xs'}
                            variant={'outline'}
                            onClick={() => setOpen(false)}
                            aria-label='Close'
                        >
                            <FaXmark />
                        </IconButton>
                    </DialogHeader>
                    <DialogBody className={styles.body}>{children}</DialogBody>
                    {buttons && (
                        <DialogFooter className={styles.footer}>
                            {buttons.map(({ ...props }, index) => (
                                <Button
                                    key={'modalButton_' + index}
                                    {...props}
                                />
                            ))}
                        </DialogFooter>
                    )}
                </DialogContent>
            </div>
        </DialogRoot>
    );
};

export default DraggableModal;
