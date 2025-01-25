'use client';
import {ReactNode, Suspense} from 'react';

export default function Providers(props: Readonly<{children: ReactNode}>) {
  return <Suspense fallback={null}>{props.children}</Suspense>;
}
