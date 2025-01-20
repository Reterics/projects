import React from 'react';
import { createRoot } from 'react-dom/client';


export default function mountComponent<P, R = HTMLElement|boolean>(
    Component: React.ComponentType<P & { onClose: (result: R) => void }>,
    props?: Omit<P, 'onClose'>,
): Promise<R> {
    return new Promise((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);

        const cleanup = () => {
            root.unmount();
            container.remove();
        };

        const handleClose = (result: R) => {
            resolve(result);
            cleanup();
        };

        root.render(
            <div className='top-0 left-0 absolute'>
                <Component
                    {...(props as P)}
                    onClose={handleClose}
                />
            </div>
        );
    });
}

