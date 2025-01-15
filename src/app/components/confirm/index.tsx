import React from 'react';
import { createRoot } from 'react-dom/client';
import ConfirmDialog from './ConfirmDialog';

export function confirm(
    message: React.ReactNode,
    options?: { confirmMessage?: string; cancelMessage?: string }
): Promise<HTMLElement | boolean> {
    return new Promise((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);

        const cleanup = () => {
            root.unmount();
            container.remove();
        };

        const handleConfirm = (target: HTMLElement | null) => {
            resolve(target || true);
            cleanup();
        };

        const handleCancel = () => {
            resolve(false);
            cleanup();
        };

        root.render(
            <div className='top-0 left-0 absolute'>
                <ConfirmDialog
                    message={message}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    confirmMessage={options?.confirmMessage}
                    cancelMessage={options?.cancelMessage}
                />
            </div>
        );
    });
}
