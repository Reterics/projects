'use client';
import { ReactNode } from 'react';

export default function Providers(props: Readonly<{ children: ReactNode }>) {
    return <>{props.children}</>;
}
