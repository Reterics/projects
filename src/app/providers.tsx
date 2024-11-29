'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

export default function Providers(props: Readonly<{ children: ReactNode }>) {
    return (
        <ThemeProvider attribute='class' disableTransitionOnChange>
            {props.children}
        </ThemeProvider>
    );
}
