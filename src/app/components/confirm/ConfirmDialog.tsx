import React, {useRef} from "react";
import DraggableDiv from "@/app/components/DraggableDiv.tsx";
import {BsXLg} from "react-icons/bs";
import {controlButtonClasses, titleBarClasses, windowClasses} from "@/app/components/Dialog.tsx";

type ConfirmDialogProps = {
    message: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({
    message,
    onConfirm,
    onCancel,
}: Readonly<ConfirmDialogProps>) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const posRef = useRef<{ x: number, y: number }>({
        x: window.innerWidth / 2 - 140,
        y: window.innerHeight / 4,
    });

    const onClose = () => {
        onCancel();
    }
    return (
        <DraggableDiv ref={dialogRef} pos={posRef} handle='.title-bar'>
            <div className={windowClasses + ' w-full h-full min-w-80'}>
                <div className={`title-bar ${titleBarClasses}`}>
                    <div className="flex items-center space-x-2 ml-1">
                        <span className="font-bold text-sm">Confirmation</span>
                    </div>
                    <div className="flex items-center">

                        <button className={controlButtonClasses} onClick={onClose} title="Close">
                            <BsXLg/>
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-auto p-2">
                    {message}
                </div>
                <div className="flex">
                    <button type="button"
                            onClick={() => onConfirm()}
                            className="w-full border border-zinc-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-2.5 py-2.5 text-center bg-primary-600 hover:bg-primary-700 focus:ring-primary-800">Yes
                    </button>
                    <button type="button"
                            onClick={() => onCancel()}
                            className="w-full border border-zinc-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-2.5 py-2.5 text-center bg-primary-600 hover:bg-primary-700 focus:ring-primary-800">No
                    </button>
                </div>
            </div>
        </DraggableDiv>
    )
}
