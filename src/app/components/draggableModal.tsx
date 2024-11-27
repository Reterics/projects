import React, {useRef, useState} from 'react';
import {
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogBody,
    Button, DialogRoot, DialogTitle, DialogActionTrigger, DialogCloseTrigger, DialogTrigger,
} from '@chakra-ui/react';

interface DraggableModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

let dragging = false;
let initialX = 0;
let initialY = 0;
let initialTop = 0;
let initialLeft = 0;

const DraggableModal: React.FC<DraggableModalProps> = ({ open, setOpen, title, children }) => {
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
      <DialogRoot lazyMount open={open} onOpenChange={(e) => setOpen(e.open)}>
          <DialogTrigger />

          <div
              className="dialog-container"
              onMouseDown={handleMouseDown}
              ref={dialogRef}
              style={{
                  position: 'absolute',
                  top: `${dialogPosition.top}px`,
                  left: `${dialogPosition.left}px`,
                  minWidth: '12em',
          }}
          >
              <DialogContent>
                  <DialogCloseTrigger />

                  <DialogHeader
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      className="dialog-header"
                      cursor="move">
                      <DialogTitle>{title}</DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                      {children}
                  </DialogBody>
                  <DialogFooter>
                      <DialogActionTrigger asChild>
                          <Button variant="outline">Cancel</Button>
                      </DialogActionTrigger>
                      <Button colorPalette="red">Okay</Button>
                  </DialogFooter>
              </DialogContent>
          </div>
      </DialogRoot>
  );
};

export default DraggableModal;
