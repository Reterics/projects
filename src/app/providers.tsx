'use client';
import { ReactNode } from 'react';
import {PrimeReactProvider} from "primereact/api";
import 'primeicons/primeicons.css';
import { twMerge } from 'tailwind-merge';

export default function Providers(props: Readonly<{ children: ReactNode }>) {
    return (
        <PrimeReactProvider value={
            {
                inputStyle: 'outlined',
                unstyled: false,
                pt: {}, ptOptions: { mergeSections: true, mergeProps: true, classNameMergeFunction: twMerge }
            }

        }>
            {props.children}
        </PrimeReactProvider>
    );
}
