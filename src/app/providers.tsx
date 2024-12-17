'use client';
import { ReactNode } from 'react';
import 'primeicons/primeicons.css';

export default function Providers(props: Readonly<{ children: ReactNode }>) {
    return (
        <>{props.children}</>
    );
}
