import React from 'react';
import ConfirmDialog from './ConfirmDialog';
import mountComponent from "@/app/components/utilComponents/mounter.tsx";


export async function confirm(
    message: React.ReactNode,
    options?: { confirmMessage?: string; cancelMessage?: string }
): Promise<HTMLElement | boolean | null> {
    return await mountComponent(ConfirmDialog, {
        ...options,
        message: message
    });
}
